import json
import keras
import keras.preprocessing.text as kpt
from keras.preprocessing.text import Tokenizer
from keras.models import model_from_json
import pandas as pd
import numpy as np
from pathlib import Path

pd.set_option('display.max_columns', 500)

# loading in the calls manually
data = pd.read_csv("../model/datasets/raw_single_call.csv")

# BASIC DATA PREP
data = data.rename(columns={'Prospect/Non-Prospect': 'Type'})
data = data.loc[:, data.columns.intersection(['Date', 'Time', 'Duration', 'Type', 'Call Status', 'Call Id', 'Words'])]
data = data[data.Type != 'General Business']

# TRANSFORMING DATE AND TIME INTO FEATURES
from datetime import date
from datetime import datetime

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

pre_encode = pd.read_csv("../model/datasets/pre_encode.csv", error_bad_lines=False)
pre_encode['Temp'] = True
data['Temp'] = False

encode = pd.concat([pre_encode, data])

encode['Type'] = 'type_' + encode['Type'].astype(str)
encode['Call Status'] = 'status_' + encode['Call Status'].astype(str)
type_dummies = pd.get_dummies(encode['Type'])
status_dummies = pd.get_dummies(encode['Call Status'])
encode = pd.concat([encode, type_dummies], axis=1)
encode = pd.concat([encode, status_dummies], axis=1)

# recombine and drop useless attributes
data = encode[encode.Temp != True]
data = data.drop(['Temp', 'Match', 'Type', 'Call Status'], axis=1)
print(data.head())

# TRANSFORMING TRANSCRIPTION TO FEATURE

# create a tokenizer
t = Tokenizer(num_words=None, lower=True, split=' ')

# open up dictionary 
with open('../model/dict.json', 'r') as dictionary_file:
    dict = json.load(dictionary_file)

t.word_index = dict

def convert_text_to_index_array(text):
    return [dict[word] for word in kpt.text_to_word_sequence(text)]

allWords = []
transcriptions = data['Words']
for text in transcriptions:
    words = convert_text_to_index_array(text)
    allWords.append(words)

input_words = t.sequences_to_matrix(allWords, mode='binary')

# PUT IT ALL TOGETHER
data = data.drop(['Call Id', 'Words'], axis=1)
data = data.fillna(0)
print(data)

input_other = data.to_numpy()
input_x = np.concatenate((input_other, input_words), axis=1)

np.set_printoptions(threshold=np.nan)

# # LOAD AND RUN THE MODEL

# Standardize attribute data
from sklearn.preprocessing import StandardScaler
from sklearn.externals import joblib

# Load in predefined scaler
scaler = joblib.load('../model/std_scaler.save')
input_x = scaler.transform(input_x)

print(input_x)

#load model
json_file = open('../model/complete_model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
# create model from this
model = model_from_json(loaded_model_json)
model.load_weights('../model/complete_model.h5')

labels = ['0','1']

for s in input_x:
    pred = model.predict(np.asmatrix(s))
    print(np.argmax(pred))
    print((labels[np.argmax(pred)], pred[0][np.argmax(pred)]*100))








