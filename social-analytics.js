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

// Calculate the followedBy lists and add the results to the data object.
function calculateFollowedBy(){
  _.chain(data)
  .map((u, userId) =>
    u.follows.map(followsId => {
      return {followsId: followsId, followedBy: userId};
    })
  )
  .flatten()
  .groupBy("followsId")
  .each((followedBySet, followsId) => {
    data[followsId].followedBy = _(followedBySet).pluck("followedBy");
  });
}
calculateFollowedBy()

function userForId(userId) {
  return data[userId];
}

function formatUser(name, id) {
  return `${name}(${id})`;
}

function userListString(userIds) {
  return userIds
    .map(id => Object.assign({userId: id}, userForId(id)))
    .map(u => formatUser(u.name, u.userId))
    .join(", ");
}

function printUser(user, userId) {
  console.log(`${formatUser(user.name, userId)} ----------------`);
  let follows = userListString(user.follows);
  let followedBy = userListString(user.followedBy);
  console.log(`Follows: ${follows}`);
  console.log(`Followed by: ${followedBy}`);
}

function printUsers() {
  _(data).each((user, userId) => printUser(user, userId));
}

// apply a function to the expanded version of follows or followedBy and store the results
function followFilterFunction(field, fn) {
  return _.chain(data)
    .map((u, userId) => {
      let result = u[field].map(userForId).filter(u => fn(u));
      return Object.assign({userId: userId, result:result}, u);
    });
}

// For each user, find the set of users they follow who haven't followed them back.
function followNotFollowedBack() {
  return _(data)
    .map(u => {
      var followedBySet = new Set(u.followedBy),
          difference = u.follows.filter(x => !followedBySet.has(x));
      return Object.assign({difference: difference}, u);
    });
}

// Find reach of a node.
function reach(u) {
  var mine = new Set(u.followedBy);
  var children = u.followedBy
    .map(userForId)
    .map(u => new Set(u.followedBy));
  // find the union of the children and this node
  return children
    .reduce((a, b) => {
      b.forEach(x => a.add(x));
      return a;
    }, mine);
}

// Do a dump of the data so we can see what we got.
console.log(data);
printUsers();
console.log("-------------------");

var mostFollowed = _(data).max(u => u.followedBy.length);
var mostFollowedOver30 = followFilterFunction("followedBy", u => u.age > 30).max(t => t.result.length).value();
var mostFollowingOver30 = followFilterFunction("follows", u => u.age > 30).max(t => t.result.length).value();
console.log("Most followers:", mostFollowed.name, mostFollowed.followedBy.length);
console.log("Most followers over 30:", mostFollowedOver30.name, mostFollowedOver30.userId, mostFollowedOver30.result.length);
console.log("Most following over 30:", mostFollowingOver30.name, mostFollowingOver30.result.length);
console.log("-------------------");

console.log("Users following users who don't follow them back.");
followNotFollowedBack()
  .forEach(t => {
    if(t.difference.length) {
      console.log(`${t.name}: ${userListString(t.difference)}`);
    }
  });
console.log("-------------------");

console.log("Reach:")
_(data).forEach(u => {
  let r = reach(u);
  console.log(`${u.name}: ${r.size}`);
  console.log(r);
});
