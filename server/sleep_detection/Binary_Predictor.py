#!/usr/bin/python

import pickle, sys, getopt
import pandas as pd

def main(argv):
    
    try:
        opts, args = getopt.getopt(argv, "hm:i:o:", ["help", "modelFile=", "inFile=", "outFile="])
    except getopt.GetoptError:
        # print help information and exit:
        print('''
  ================================================================
                      OPTIONS ERROR
  ================================================================
    usage: Binary_Predictor.py <modelFile> <inFile> <outFile>
    for more instructions: Binary_Predictor.py -h || --help
        ''')
        sys.exit(2)
        
    """if argv has 3 elements"""
    if len(argv) == 3:
        mFile = argv[0]
        iFile = argv[1]
        oFile = argv[2]
    
    for opt, arg in opts:
        if opt == '-h':
            print('''
  ======================================================================================================
                                                HELP MESSAGE
  ======================================================================================================
    standard usage: Binary_Predictor.py <regressor model file> <input file> <output file>
    print('short options: -m <regressor model file> -i <input file> -o <output file>
    print('long options: -modelFile= <regressor model file> -inFile <input file> -outFile <output file>
  ======================================================================================================
                ''')
            sys.exit()
        elif opt in ("-m", "--modelFile"):
            mFile = arg
        elif opt in ("-i", "--inFile"):
            iFile = arg
        elif opt in ("-o", "--outFile"):
            oFile = arg
            
    if (len(argv) != 3 and len(argv) != 6):
        print('''
  ================================================================
                      PARAMETERS ERROR
  ================================================================
   usage: Binary_Predictor.py <modelFile> <inFile> <outFile>
   for more instructions: Binary_Predictor.py -h || --help
  ================================================================
              ''')
        sys.exit(2)
    
    # load random forest regressor model from file
    regressor = pickle.load(open(mFile, 'rb'))
    # load data from csv file
    df = pd.read_json(iFile)
    
    #features array
    features = ['intensity',
                'heart_rate',
                'time_from_last_movement'
                ]
    
    #independent variables
    input_data = df.loc[:, features].values
    
    predicted_data = regressor.predict(input_data)
    
    # save data to csv
    input_df = pd.DataFrame(data=input_data, columns=features)
    predicted_df = pd.DataFrame(data=predicted_data, columns=['is_sleeping'])
    final_df = input_df.join(predicted_df, how='outer')
    final_df.to_csv(oFile, index = False)
    df_to_server = final_df[['timestamp', 'intensity', 'heart_rate', 'is_sleeping']]
    print(df_to_server.to_json(orient='records'))

if __name__ == '__main__':
    main(sys.argv[1:])