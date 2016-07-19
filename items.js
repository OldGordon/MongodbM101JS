/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

function ItemDAO(database) {
    "use strict";
    this.db = database;
    var list = this.db.collection("item");
    
    
    this.getCategories = function(callback) {
        "use strict";

        list.aggregate([{"$group": {"_id": "$category","num": {"$sum": 1}}},
                        {"$sort": { "_id": 1}}])
                        .toArray(function(err, categories) {
                            assert.equal(null, err);
                            var prov, allCatNum = 0;
                            categories.forEach(function(prod) {
                                prov = prod.num,
                                allCatNum += prov;
                            });
                            categories.unshift({
                                "_id": "All",
                                "num": allCatNum
                            });
                            callback(categories);
                        });
        
    };

    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";
            
        if (category && category === "All"){
           list.aggregate([{"$project":{"_id": 1, "title": 1,"description": 1,
                                        "slogan": 1, "stars": 1, "category": 1,
                                        "img_url": 1, "price": 1, "reviews": 1}},
                           {"$skip":  page * itemsPerPage},
                           {"$limit": itemsPerPage},
                           {"$sort": { "_id": 1}}])
                           .toArray(function(err, pageItems){
                             assert.equal(null, err);
                             callback(pageItems);
                           });
        }else if (category !== "All"){
            list.aggregate([{"$match":{"category": category }},
                            {"$project":{"_id": 1, "title": 1,"description": 1,
                                         "slogan": 1, "stars": 1, "category": 1,
                                         "img_url": 1, "price": 1, "reviews": 1}},
                            {"$skip":  page * itemsPerPage },
                            {"$limit": itemsPerPage},
                            {"$sort": { "_id": 1}}])
                            .toArray(function(err, pageItems){
                              assert.equal(null, err);
                              callback(pageItems);
                            });
        }
        
    };

    this.getNumItems = function(category, callback) {
        "use strict";

        var numItems = 0;
        
        if(category === "All"){
            list.aggregate([{"$sort":{"_id": 1}}])
                            .toArray(function(err, provArr){
                           assert.equal(null, err);
                           var numItems = provArr.length ;
                           callback(numItems);
                         });
        }else{
        list.aggregate([{"$match":{"category": category}}])
                         .toArray(function(err, provArr){
                          assert.equal(null, err);
                          var numItems = provArr.length ;
                          callback(numItems);
                         });
        }
        
    }
    
    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        
         list.aggregate([{"$match":{"$text":{"$search": query}}},
                        {"$skip":  page * itemsPerPage },
                        {"$limit": itemsPerPage},
                        {"$sort": { "_id": 1}}])
                        .toArray(function(err, items){
                          assert.equal(null, err);
                          callback(items);
                         });
      }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;

        list.aggregate([{"$match":{"$text":{"$search": query}}}])
                        .toArray(function(err, provArr){
                                    assert.equal(null, err);
                                    numItems = provArr.length;             
                                    callback(numItems);                       
                                });
        
     };


    this.getItem = function(itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */
         list.find({"_id": itemId})
             .toArray(function(err, provArr){
                       assert.equal(null, err);
                       callback(provArr[0]);
         })
       

        
        
    };


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };
        list.update(
            {"_id": itemId},
            {"$push":{"reviews": reviewDoc }}
        );
        list.find({"_id": itemId})    
        callback(reviewDoc);        
        
     
        
    };

    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    };
}


module.exports.ItemDAO = ItemDAO;
