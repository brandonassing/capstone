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

# print(os.getcwd())

# Assign spreadsheet filename to `file`
file = '1.xlsx'

# Load spreadsheet
xl = pd.ExcelFile(file)

# Print the sheet names
# print(xl.sheet_names)

# Load a sheet into a DataFrame by name: invoice_data
invoice_data = xl.parse('Sheet1')
invoice_data['Discount'].fillna(0, inplace=True)
# print(invoice_data.head())
# print(invoice_data['Location Address'].unique()[0])

location_address = invoice_data['Location Address'].unique()[0].upper()
location_city = invoice_data['Location City'].unique()[0]
location_province = invoice_data['Location Province'].unique()[0]
location_pc = invoice_data['Location PC'].unique()[0]
location_complete = location_address + ', ' + location_city + \
    ', ' + location_province + ' ' + location_pc
location_complete = location_complete.upper()

c = clients.find_one({"address": location_complete})
# print(c['calls'][0])

# invoice: [{
#     date: Date,
#     quantity: Number,
#     itemCode: String,
#     description: String,
#     discount: Number,
#     amountAfterDiscount: Number,
#     tech: String
# }]

# invoices = []

for index, row in invoice_data.iterrows():
    invoice_date = row['Inv Date'].date()
    invoice_date = invoice_date.strftime('%Y-%m-%d')
    quantity = row['Qty']
    item_code = row['Item Code']
    description = row['Item Description']
    discount = row['Discount']
    amount_after_discount = row['Amount After Discount']
    tech = row['Tech']

    # print(invoice_date)
    # print(type(invoice_date.date()))
    # print(type(quantity))
    # print(type(item_code))
    # print(type(description))
    # print(type(discount))
    # print(type(amount_after_discount))
    # print(type(tech))

    data = {
        "date": invoice_date,
        "quantity": quantity,
        "itemCode": item_code,
        "description": description,
        "discount": discount,
        "amountAfterDiscount": amount_after_discount,
        "tech": tech
    }

    json_data = json.dumps(data)
    db.clients['calls'][0]['invoices'].insert_one(json_data)
    # invoices.append(json_data)
    # print(c['calls'][0])

    # print(json_data)
# invoices = json.loads(invoices)
# print(str(invoices))

# print(clients.insert_many(str(invoices)))
