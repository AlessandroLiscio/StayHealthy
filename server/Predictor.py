#!/usr/bin/python
import pickle, sys, getopt
import pandas as pd
from pandas.io.json import json_normalize
from joblib import load
import numpy as np

def main(argv):
    
    try:
        opts, args = getopt.getopt(argv, "hm:i:", ["help", "modelFile=", "inFile="])
    except getopt.GetoptError:
        # print help information and exit:
        print('''
  ================================================================
                      OPTIONS ERROR
  ================================================================
    usage: Binary_Predictor.py <modelFile> <inFile>
    for more instructions: Binary_Predictor.py -h || --help
        ''')
        sys.exit(2)
        
    """if argv has 2 elements"""
    if len(argv) == 2:
        mFile = argv[0]
        iFile = argv[1]
    
    for opt, arg in opts:
        if opt == '-h':
            print('''
  ======================================================================================================
                                                HELP MESSAGE
  ======================================================================================================
    standard usage: Binary_Predictor.py <regressor model file> <input file>
    print('short options: -m <regressor model file> -i <input file>
    print('long options: -modelFile= <regressor model file> -inFile <input file>
  ======================================================================================================
                ''')
            sys.exit()
        elif opt in ("-m", "--modelFile"):
            mFile = arg
        elif opt in ("-i", "--inFile"):
            iFile = arg
            
    if (len(argv) != 2 and len(argv) != 4):
        print('''
  ================================================================
                      PARAMETERS ERROR
  ================================================================
   usage: Binary_Predictor.py <modelFile> <inFile>
   for more instructions: Binary_Predictor.py -h || --help
  ================================================================
              ''')
        sys.exit(2)
    # load random forest regressor model from file
    regressor = pickle.load(open(mFile, 'rb'))
    # load data from csv file
    global df
    df = pd.read_json(iFile)
    
    #adjust heart rate
    last_valid = 80
    for index, row in df.iterrows():
        
        if(row['heart_rate'] != 255.0):
            last_valid = row['heart_rate']
        else:
            if(last_valid != 255):
                df.at[index, 'heart_rate'] = last_valid
                last_valid = 255
    
    # sliding windows to calculate the heart_rate features
    window_size = 10
    half_window = int(window_size/2)
    df['heart_std'] = 0
    df['heart_max'] = 0
    for i in range(0, len(df)):
        #set start index and last index
        start_index = i - half_window
        last_index = i + half_window
        if start_index < 0:
            start_index = 0
        if last_index > len(df) - 1:
            last_index = len(df) - 1
        window_signal = np.array(df['heart_rate'][(start_index):(last_index)])
        max_window = np.nanmax(window_signal)
        min_window = np.nanmin(window_signal)
        mean_window = np.nanmean(window_signal)
        std_window = np.nanstd(window_signal)
        df.at[i,'heart_min'] = min_window
        df.at[i,'heart_max'] = max_window
        df.at[i,'heart_mean'] = mean_window
        df.at[i,'heart_std'] = std_window
    
    #add time from last movement
    counter1 = 0
    for index, row in df.iterrows():
        if(index == 0):
            df.at[index, 'time_from_last_movement'] = 0
        else:
            if(df.loc[index, 'intensity'] > 0):
                counter1 = 0
            else:
                counter1 += 1
            df.at[index, 'time_from_last_movement'] = counter1
    
    #features array
    features = ['intensity',
                'heart_max',
                'heart_mean'
                ]
    
    #independent variables
    input_data = df.loc[:, features].values
    
    global predicted_data
    predicted_data = regressor.predict(input_data)
    
    # save data to csv
    global predicted_df
    predicted_df = pd.DataFrame(data=predicted_data, columns=['is_sleeping'])
    print(predicted_df.to_json(orient='records'))
    
if __name__ == '__main__':
    main(sys.argv[1:])