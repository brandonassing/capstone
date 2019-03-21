import json
import sys
import keras
import keras.preprocessing.text as kpt
from keras.preprocessing.text import Tokenizer
from keras.models import model_from_json
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.externals import joblib
from datetime import date
from datetime import datetime


pd.set_option('display.max_columns', 500)

# loading in the calls manually
data = pd.read_csv(sys.argv[1])

# BASIC DATA PREP
data = data.rename(columns={'Prospect/Non-Prospect': 'Type'})
data = data.loc[:, data.columns.intersection(
    ['Date', 'Time', 'Duration', 'Type', 'Call Status', 'Call Id', 'Words'])]
data = data[data.Type != 'General Business']

# TRANSFORMING DATE AND TIME INTO FEATURES

dates = data['Date']
times = data['Time']

weekdays = []
months = []

for d in dates:
    d_format = "%m/%d/%Y"
    dt = datetime.strptime(d, d_format)
    weekdays.append(dt.weekday())
    months.append(dt.month)

hours = []

for t in times:
    h = t.split(':')[0]
    if(t[-2:] == "PM"):
        h = int(h) + 12
    hours.append(float(h))

data['Weekday'] = weekdays
data['Month'] = months
data['Hour'] = hours

data['mnth_sin'] = np.sin(data.Month*(2.*np.pi/24))
data['day_sin'] = np.sin(data.Weekday*(2.*np.pi/24))
data['hr_sin'] = np.sin(data.Hour*(2.*np.pi/24))
data['mnth_cos'] = np.cos((data.Month-1)*(2.*np.pi/12))
data['day_cos'] = np.cos((data.Weekday-1)*(2.*np.pi/12))
data['hr_cos'] = np.cos((data.Hour-1)*(2.*np.pi/12))

data = data.drop(['Date', 'Time', 'Hour', 'Month', 'Weekday'], axis=1)


# TRANSFORMING CATEGORICALS INTO FEATURES

def enc(pre_encode, data):
    pre_encode['Temp'] = True
    data['Temp'] = False
    # combine pre encoded data with new data
    encode = pd.concat([pre_encode, data], sort=False)
    # one hot encode this combined dataset
    encode['Type'] = 'type_' + encode['Type'].astype(str)
    encode['Call Status'] = 'status_' + encode['Call Status'].astype(str)
    type_dummies = pd.get_dummies(encode['Type'])
    status_dummies = pd.get_dummies(encode['Call Status'])
    encode = pd.concat([encode, type_dummies], axis=1)
    encode = pd.concat([encode, status_dummies], axis=1)
    # recombine and drop useless attributes
    encode = encode[encode.Temp != True]
    encode = encode.drop(['Temp', 'Type', 'Call Status'], axis=1)
    return encode


# Conversion Prob
pre_enc_conv_prob = pd.read_csv(
    "model/datasets/pre_encode.csv", error_bad_lines=False)
data_conv_prob = enc(pre_enc_conv_prob, data)
data_conv_prob = data_conv_prob.drop(['Match'], axis=1)

# Value Estimator
pre_enc_value_est = pd.read_csv(
    "model/datasets/pre_encode_values.csv", error_bad_lines=False)
data_value_est = enc(pre_enc_value_est, data)
data_value_est = data_value_est.drop(["V_Range", "Unnamed: 0"], axis=1)


# TRANSFORMING TRANSCRIPTION TO FEATURE

def convert_text_to_index_array(text, dict):
    found_words = []
    for word in kpt.text_to_word_sequence(text):
        if(word in dict.keys()):
            found_words.append(dict[word])
    return found_words

    # return [dict[word] for word in kpt.text_to_word_sequence(text)]


def tokenize(dic, data):
    # create a tokenizer and feed in word index
    t = Tokenizer(num_words=None, lower=True, split=' ')
    t.word_index = dic
    # convert words from each call transcription into an index array
    allWords = []
    transcriptions = data['Words']
    for text in transcriptions:
        words = convert_text_to_index_array(text, dic)
        allWords.append(words)
    # convert index array into a matrix and return it
    return t.sequences_to_matrix(allWords, mode='binary')


# Conversion Probability
with open('model/dict.json', 'r') as dictionary_file:
    dict_conv_prob = json.load(dictionary_file)
input_words_conv_prob = tokenize(dict_conv_prob, data_conv_prob)

# Value Estimate
with open('model/dict_values.json', 'r') as dictionary_file:
    dict_value_est = json.load(dictionary_file)
input_words_value_est = tokenize(dict_value_est, data_value_est)


# PUT IT ALL TOGETHER

np.set_printoptions(threshold=np.nan)


def combine_inputs(input_w, data):
    data = data.drop(['Call Id', 'Words'], axis=1)
    data = data.fillna(0)
    print(data)
    input_o = data.to_numpy()
    input_x = np.concatenate((input_o, input_w), axis=1)
    return input_x


# Conversion Probability
input_x_conv_prob = combine_inputs(input_words_conv_prob, data_conv_prob)

# Value Estimate
input_x_value_est = combine_inputs(input_words_value_est, data_value_est)


# SCALE AND LOAD MODEL

# Conversion Probability
scaler_conv_prob = joblib.load('model/std_scaler.save')  # load scaler
input_x_conv_prob = scaler_conv_prob.transform(input_x_conv_prob)
json_file = open('model/complete_model.json', 'r')  # load model
loaded_model_json = json_file.read()
json_file.close()
model_conv_prob = model_from_json(loaded_model_json)  # create model
model_conv_prob.load_weights('model/complete_model.h5')

# Value Estimator
scaler_value_est = joblib.load(
    'model/std_scaler_values.save')  # load scaler
input_x_value_est = scaler_value_est.transform(input_x_value_est)
json_file = open('model/complete_model_values.json', 'r')  # load model
loaded_model_json = json_file.read()
json_file.close()
model_value_est = model_from_json(loaded_model_json)  # create model
model_value_est.load_weights('model/complete_model_values.h5')


# RUN THE MODEL

conv_prob = []
value_est = []

# Conversion Probability
labels_conv_prob = ['0', '1']

for s in input_x_conv_prob:
    pred = model_conv_prob.predict(np.asmatrix(s))
    if(labels_conv_prob[np.argmax(pred)] == '0'):
        conv_prob.append(1-pred[0][np.argmax(pred)])
    else:
        conv_prob.append(pred[0][np.argmax(pred)]*100)

# Value Estimation
labels_value_est = ['1', '2', '3']

for s in input_x_value_est:
    pred = model_value_est.predict(np.asmatrix(s))
    value_est.append(labels_value_est[np.argmax(pred)])

print(conv_prob)
print(value_est)
