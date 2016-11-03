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

// add followed by arrays to the data object
_.forEach(followedBy, (followers, userId) => {
  data[userId]["followedBy"] = followers;
});

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

// apply a filter to the follows or followedBy filter
function followFilter(field, fn) {
  return _.chain(data).map(u => {
    return [u, u[field].map(userForId).filter(u => fn(u))]
  });
}

var mostFollowed = _.max(data, u => u.followedBy.length);
var mostFollowedOver30 = followFilter("followedBy", u => u.age > 30).max(t => t[1].length).value();
var mostFollowingOver30 = followFilter("follows", u => u.age > 30).max(t => t[1].length).value();

// For each user, find the set of users they follow who haven't followed them back.
function followNotFollowedBack() {
  return _.chain(data).map(u => {
    var followedBySet = new Set(u.followedBy),
        difference = u.follows.filter(x => !followedBySet.has(x));
    return [u, difference];
  }).value();
}

// Find reach of a node.
function reach(u, depth) {
  var mine = new Set(u.followedBy)
  if (depth === 0) {
    return mine;
  }
  else {
    let children = u.followedBy.map(userForId).map(u => reach(u, depth-1));
    return children.reduce((a, b) => {
      b.forEach(x => a.add(x));
      return a;
    }, mine);
  }
}

// Do a dump of the data so we can see what we got.
console.log(data);
printUsers();

console.log("-------------------");
console.log("Most followers:", mostFollowed.name, mostFollowed.followedBy.length);
console.log("Most followers over 30:", mostFollowedOver30[0].name, mostFollowedOver30[1].length);
console.log("Most following over 30:", mostFollowingOver30[0].name, mostFollowingOver30[1].length);

console.log("-------------------");
console.log("Users following users who don't follow them back.");
followNotFollowedBack().forEach(t => {
  if(t[1].length) {
    console.log(`${t[0].name}: ${userListString(t[1])}`);
  }
});

console.log("-------------------");
console.log("Reach:")
_.forEach(data, u => {
  let r = reach(u, 1);
  console.log(`${u.name}: ${r.size}`);
  console.log(r);
});
