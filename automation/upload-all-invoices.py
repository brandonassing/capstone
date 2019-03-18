import os
import pandas as pd
import pymongo
import dns
import json

# DB connection
client = pymongo.MongoClient(
    "mongodb+srv://main:se4450@main-ia8yw.mongodb.net/test?retryWrites=true")
db = client.Main

clients = db.clients

# Retrieve current working directory (`cwd`)
cwd = os.getcwd()
cwd

# Change directory
os.chdir("./invoices")

# List all files and directories in current directory
os.listdir('.')

# Assign spreadsheet filename to `file`
file = 'all.xlsx'

# Load spreadsheet
xl = pd.ExcelFile(file)

# Load a sheet into a DataFrame by name: invoice_data
invoice_data = xl.parse('Sheet1')
invoice_data['Discount'].fillna(0, inplace=True)
invoice_data['Amount After Discount'].fillna(0, inplace=True)

location_address = ""
for i, row in invoice_data.iterrows():
    
    current_address = row['Location Address'].upper()

    if (current_address != location_address):
        location_address = row['Location Address'].unique().upper()
        location_city = row['Location City'].unique()
        location_province = row['Location Province'].unique()
        location_pc = row['Location PC'].unique()
        location_complete = location_address + ', ' + location_city + \
            ', ' + location_province + ' ' + location_pc
        location_complete = location_complete.upper()

        firstName = row['Billing first name']
        lastName = row['Billing last name']
        phoneNumber = row['Caller Number']

        # clientSkip = 0

        newClient = {
            "firstName": firstName,
            "lastName": lastName,
            "phoneNumber": phoneNumber,
            "address": location_complete,
            "calls": []
        }

    while location_address == row['Location Address'].unique()[i+1].upper():
        callId = str(row['Call Id'])
        callTime = str(row['Date']) + " " + str(row['Time'])
        newClientCalls = {
            "callId": callId,
            "worker": "",
            "estimateValue": 0,
            "opportunityProbability": 0.50,
            "timestamp": callTime,
            "status": "completed",
            "invoice": []
        }
        # TODO add mongo id

    clients.insert_one(newClient)
        
















