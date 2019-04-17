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
    regressor = load(mFile)
    # load data from csv file
    global df
    df = pd.read_json(iFile)
    
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
                'heart_rate',
                'time_from_last_movement'
                ]
    
    #independent variables
    input_data = df.loc[:, features].values
    final_data = df.loc[:, ['timestamp','intensity','heart_rate'] ]
    
    predicted_data = regressor.predict(input_data)
    
    # save data to csv
    predicted_df = pd.DataFrame(data=predicted_data, columns=['is_sleeping'])
    final_df = final_data.join(predicted_df, how='outer')
    print(predicted_df.to_json(orient='records'))
    
if __name__ == '__main__':
    main(sys.argv[1:])