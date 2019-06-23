#%%
import pandas as pd

#%%
test = pd.read_csv("group_genres_year.csv")

#%%
test.head()

#%%
mydict = {"name": "genres", "children": []}

for g, df in test.groupby("genres"):
    newdict = {}
    newdict["name"] = g
    newdict["children"] = []
    for rowtup in df.iterrows():
        ind, data = rowtup
        yeardict = {"year": data["years"], "numbers": data["numbers"]}
        newdict["children"].append(yeardict)
    # end for
    mydict["children"].append(newdict)
# print(mydict)
    
    


#%%
import json
with open("jsongenres.json", 'w') as jsonfile:
    jsonfile.write(json.dumps(mydict, indent=5))

#%%
