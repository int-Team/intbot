function numberToKorean(number){
  if (number >= Infinity)  return '무량대수'
  var inputNumber  = number < 0 ? false : number
  var unitWords    = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극']
  var splitUnit    = 10000
  var splitCount   = unitWords.length
  var resultArray  = []
  var resultString = ''

  for (var i = 0; i < splitCount; i++){
    var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i)
    unitResult = Math.floor(unitResult)
    if (unitResult > 0){
      resultArray[i] = unitResult
    }
  }

  for (var a = 0; a < resultArray.length; a++){
    if(!resultArray[a]) continue
    resultString = String(resultArray[a]) + unitWords[a] + ' ' + resultString
  }

  return resultString.replace(/ $/, '')
}

module.exports = numberToKorean