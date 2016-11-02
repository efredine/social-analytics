"use strict";
var _ = require('underscore');
var data =
  {"f01": {name: "Alice",
           age: 15,
           follows: ["f02", "f03", "f04"]},
   "f02": {name: "Bob",
           age: 20,
           follows: ["f05", "f06"]},
   "f03": {name: "Charlie",
           age: 35,
           follows: ["f01", "f04", "f06"]},
   "f04": {name: "Debbie",
           age: 40,
           follows: ["f01", "f02", "f03", "f05", "f06"]},
   "f05": {name: "Elizabeth",
           age: 45,
           follows: ["f04"]},
   "f06": {name: "Finn",
           age: 25,
           follows: ["f05"]}}

var followedBy = _.reduce(data, (followedBy, user, userId) => {
  user.follows.forEach(followsId => {
      if(!followedBy[followsId]) {
        followedBy[followsId] = [];
      }
      followedBy[followsId].push(userId);
    });
    return followedBy;
  }, {});

_.forEach(followedBy, (followers, userId) => {
  data[userId]["followedBy"] = followers;
});

function getFollowsList(user) {
  if(user && user.follows && user.follows.length > 0) {
    return user.follows.map(userId => data[userId]).filter(user => user);
  }
  else {
    return null;
  }
}

function userForId(userId) {
  return data[userId];
}

function userListString(userIds) {
  var names = userIds.map(userForId).map(a => a.name);
  return _.zip(userIds, names).map(t => `${t[1]}(${t[0]})`).join(", ");
}

function printUser(user, userId) {
  if(user) {
    console.log(`${user.name}(${userId}) ---------------`);
    let follows = userListString(user.follows);
    let followedBy = userListString(user.followedBy);
    console.log(`Follows: ${follows}`);
    console.log(`Followed by: ${followedBy}`);
  }
}

function printUsers() {
  _.forEach(data, (user, userId) => printUser(user, userId));
}

printUsers();