import os
import pandas as pd
import pymongo
import dns
import json
from bson.objectid import ObjectId
import sys

# DB connection
client = pymongo.MongoClient(
    "mongodb+srv://main:se4450@main-ia8yw.mongodb.net/test?retryWrites=true")
db = client.Main
clients = db.clients

# Assign spreadsheet filename to `file`
file = sys.argv[1]

# Load spreadsheet
xl = pd.ExcelFile(file)

# Load a sheet into a DataFrame by name: invoice_data
invoice_data = xl.parse()
invoice_data['Discount'].fillna(0, inplace=True)
invoice_data['Amount After Discount'].fillna(0, inplace=True)

for address in invoice_data['Location Address'].unique():
    data1 = invoice_data.loc[invoice_data['Location Address']
                             == address]

    first_name = data1['Billing first name'].unique()[0]
    last_name = data1['Billing last name'].unique()[0]
    phone_number = data1['Caller Number'].unique()[0]
    location_address = data1['Location Address'].unique()[0].upper()
    location_city = data1['Location City'].unique()[0]
    location_province = data1['Location Province'].unique()[0]
    location_pc = data1['Location PC'].unique()[0]
    location_complete = location_address + ', ' + location_city + \
        ', ' + location_province + ' ' + location_pc
    location_complete = location_complete.upper()

    client = {
        "firstName": first_name,
        "lastName": last_name,
        "phoneNumber": str(phone_number),
        "address": location_complete,
        "calls": []
    }

    for callId in data1['Call Id'].unique():
        data2 = data1.loc[data1['Call Id'] == callId]

        call_date_time = str(data2['Date Time'].unique()[0])
        call = {
            "_id": ObjectId(),
            "callId": str(callId),
            "worker": "",
            "estimateValue": 0.00,
            "opportunityProbability": 0.00,
            "timestamp": call_date_time,
            "status": "completed",
            "invoice": []
        }

        for index, row in data2.iterrows():
            invoice_date = str(row['Inv Date'])
            quantity = row['Qty']
            item_code = row['Item Code']
            description = row['Item Description']
            discount = row['Discount']
            amount_after_discount = row['Amount After Discount']
            tech = row['Tech']
            inv = {
                "_id": ObjectId(),
                "date": invoice_date,
                "quantity": quantity,
                "itemCode": item_code,
                "description": description,
                "discount": discount,
                "amountAfterDiscount": amount_after_discount,
                "tech": tech
            }
            call['invoice'].append(inv)
        client['calls'].append(call)
    print(first_name, last_name, phone_number)
    clients.insert_one(client)
