function removeItemOnce(e, n) {
  var r = e.indexOf(n)
  return r > -1 && e.splice(r, 1), e
}
module.exports = removeItemOnce
