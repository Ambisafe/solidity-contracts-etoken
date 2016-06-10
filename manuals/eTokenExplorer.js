var loadAssets = function(assetLoadedCallback) {
  var startBlock = web3.toBigNumber('1405893');
  var step = 10000;
  var etokInt = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"proxies","outputs":[{"name":"proxy","type":"address"},{"name":"onlyProxy","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"name","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"description","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"isReissuable","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"baseUnit","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"by","type":"address"}],"name":"Issue","type":"event"}]).at('0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f');
  return new Promise(function(resolve, reject) {
    web3.eth.getBlockNumber(function(err, blockNumber) {
      if (err) {
        reject(err);
      } else {
        blockNumber = web3.toBigNumber(blockNumber);
        var steps = blockNumber.sub(startBlock).div(step).ceil();
        var assets = {};
        var collector = function(symbol) {
          return new Promise(function(resolve, reject) {
            Promise.all([
              new Promise(function(resolve, reject) {
                etokInt.name(symbol, function(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    assets[symbol].name = result;
                    resolve();
                  }
                });
              }),
              new Promise(function(resolve, reject) {
                etokInt.description(symbol, function(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    assets[symbol].description = result;
                    resolve();
                  }
                });
              }),
              new Promise(function(resolve, reject) {
                etokInt.isReissuable(symbol, function(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    assets[symbol].isReissuable = result;
                    resolve();
                  }
                });
              }),
              new Promise(function(resolve, reject) {
                etokInt.owner(symbol, function(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    assets[symbol].owner = result;
                    resolve();
                  }
                });
              }),
              new Promise(function(resolve, reject) {
                etokInt.proxies(symbol, function(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    assets[symbol].proxy = result[0];
                    resolve();
                  }
                });
              }),
              new Promise(function(resolve, reject) {
                etokInt.baseUnit(symbol, function(err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    assets[symbol].baseUnit = result.valueOf();
                    etokInt.totalSupply(symbol, function(err, result) {
                      if (err) {
                        reject(err);
                      } else {
                        assets[symbol].totalSupply = result.div(Math.pow(10, assets[symbol].baseUnit)).toFormat(assets[symbol].baseUnit);
                        resolve();
                      }
                    });
                  }
                });
              })
            ]).then(function() {
              assetLoadedCallback(assets[symbol]);
              resolve();
            }, reject);
          });
        };
        var processSpan = function(fromBlock, toBlock) {
          return new Promise(function(resolve, reject) {
            var filter = etokInt.Issue({}, {fromBlock: fromBlock, toBlock: toBlock});
            filter.get(function(err, logs) {
              filter.stopWatching();
              if (err) {
                reject(err);
              } else {
                var assetPromises = [];
                logs.forEach(function(log) {
                  var symbol = web3.toAscii(log.args.symbol);
                  if (typeof assets[symbol] === 'undefined') {
                    assets[symbol] = {};
                    assets[symbol].symbol = symbol;
                    assetPromises.push(collector(symbol));
                  }
                });
                Promise.all(assetPromises).then(function() {
                  resolve(assetPromises.length);
                }, reject);
              }
            });
          });
        };
        var fromBlock = startBlock;
        var toBlock = startBlock.add(step);
        toBlock = toBlock.gte(blockNumber) ? 'latest' : toBlock;
        var processPromises = [processSpan(fromBlock, toBlock)];
        while (toBlock !== 'latest') {
          fromBlock = toBlock.add(1);
          toBlock = toBlock.add(step);
          toBlock = toBlock.gte(blockNumber) ? 'latest' : toBlock;
          processPromises.push(processSpan(fromBlock, toBlock));
        }
        Promise.all(processPromises).then(function(result) {
          var assetsCount = 0;
          result.forEach(function(assetsCollected) {
            assetsCount += assetsCollected;
          });
          resolve(assetsCount);
        }, reject);
      }
    });
  });
};

loadAssets(function(asset) {console.log(asset);}).then(function(num) { console.log(num + ' assets loaded.'); }).catch(function(err) { throw err; });

var getCurrentBlock = function() {
  return new Promise(function(resolve, reject) {
    web3.eth.getBlockNumber(function(err, block) {
      if (err) {
        reject(err);
      } else {
        resolve(block);
      }
    });
  });
};

var listenTransfers = function(transferLoadedCallback) {
  var etoken = web3.eth.contract([{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"baseUnit","outputs":[{"name":"","type":"uint8"}],"type":"function"}])
    .at('0x0ec62107c77fcb3084e6bc8f95d4ba0d6418734f');
  return new Promise(function(resolve, reject) {
    web3.eth.getBlockNumber(function(err, block) {
      if (err) {
        reject(err);
      } else {
        var listener = etoken.Transfer({}, {fromBlock: block - 10000}, function(err, log) {
          if (err) {
            console.log(err);
            return;
          }
          var transfer = {};
          transfer.transactionHash = log.transactionHash;
          transfer.blockNumber = log.blockNumber;
          transfer.from = log.args.from;
          transfer.to = log.args.to;
          transfer.symbol = web3.toAscii(log.args.symbol);
          transfer.value = log.args.value;
          transfer.reference = log.args.reference;
          etoken.baseUnit(transfer.symbol, function(err, result) {
            if (err) {
              console.log(err);
              return;
            }
            var baseUnit = result.valueOf();
            transfer.value = transfer.value.div(Math.pow(10, baseUnit)).toFormat(baseUnit);
            web3.eth.getBlock(transfer.blockNumber, function(err, block) {
              if (err) {
                console.log(err);
                return
              }
              transfer.timestamp = block.timestamp * 1000;
              transferLoadedCallback(transfer);
            });
          });
        });
        resolve(listener);
      }
    });
  });
};

var transfersListener;
listenTransfers(function(transfer) {console.log(transfer);}).then(function(listener) {
  transferListener = listener;
});
// transfersListener.stopWatching();

var listenIssues = function(callback) {
  var etoken = web3.eth.contract([{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"baseUnit","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"symbol","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"by","type":"address"}],"name":"Issue","type":"event"}])
    .at('0x8476c7536bad7cb502108306e9b45b3ea9e6724e');
  return new Promise(function(resolve, reject) {
    web3.eth.getBlockNumber(function(err, block) {
      if (err) {
        reject(err);
      } else {
        var listener = etoken.Issue({}, {fromBlock: block - 10000}, function(err, log) {
          if (err) {
            console.log(err);
            return;
          }
          var eventLog = {};
          eventLog.transactionHash = log.transactionHash;
          eventLog.blockNumber = log.blockNumber;
          eventLog.from = "0x0000000000000000000000000000000000000000";
          eventLog.to = log.args.by;
          eventLog.by = log.args.by;
          eventLog.symbol = web3.toAscii(log.args.symbol);
          eventLog.value = log.args.value;
          etoken.baseUnit(eventLog.symbol, function(err, result) {
            if (err) {
              console.log(err);
              return;
            }
            var baseUnit = result.valueOf();
            eventLog.value = eventLog.value.div(Math.pow(10, baseUnit)).toFormat(baseUnit);
            web3.eth.getBlock(eventLog.blockNumber, function(err, block) {
              if (err) {
                console.log(err);
                return
              }
              eventLog.timestamp = block.timestamp * 1000;
              callback(eventLog);
            });
          });
        });
        resolve(listener);
      }
    });
  });
};
var issuesListener;
listenIssues(function(log) {console.log(log);}).then(function(listener) {
  issuesListener = listener;
});
// transfersListener.stopWatching();

var listenTransfersToICAP = function(callback) {
  var etoken = web3.eth.contract([{"constant":true,"inputs":[{"name":"_symbol","type":"bytes32"}],"name":"baseUnit","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"icap","type":"bytes32"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"reference","type":"string"}],"name":"TransferToICAP","type":"event"}])
    .at('0xb276f12e5f0c0e60938020e5d59525801fdf4a90'); // stage 0xb276f12e5f0c0e60938020e5d59525801fdf4a90 / prod 0x8476c7536bad7cb502108306e9b45b3ea9e6724e
  var icap = web3.eth.contract([{"constant":true,"inputs":[{"name":"_icap","type":"bytes32"}],"name":"parse","outputs":[{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"bool"}],"type":"function"}])
    .at('0xce361bfc8965be50e6e55faf3d56be3e43ac2c6a'); // stage 0xce361bfc8965be50e6e55faf3d56be3e43ac2c6a / prod 0x77d3dbde6ce2e14c7f320b6f23e6c106ccff51e0
  return new Promise(function(resolve, reject) {
    web3.eth.getBlockNumber(function(err, block) {
      if (err) {
        reject(err);
      } else {
        var listener = etoken.TransferToICAP({}, {fromBlock: block - 10000}, function(err, log) {
          if (err) {
            console.log(err);
            return;
          }
          var eventLog = {};
          eventLog.transactionHash = log.transactionHash;
          eventLog.blockNumber = log.blockNumber;
          eventLog.from = log.args.from;
          eventLog.to = log.args.to;
          eventLog.icap = web3.toAscii(log.args.icap).slice(0, 20);
          eventLog.value = log.args.value;
          eventLog.reference = log.args.reference;
          web3.eth.getBlock(eventLog.blockNumber, function(err, block) {
            if (err) {
              console.log(err);
              return
            }
            eventLog.timestamp = block.timestamp * 1000;
            icap.parse(log.args.icap, function(err, parsed) {
              if (err) {
                console.log(err);
                return
              }
              eventLog.symbol = web3.toAscii(parsed[1]);
              etoken.baseUnit(eventLog.symbol, function(err, result) {
                if (err) {
                  console.log(err);
                  return;
                }
                var baseUnit = result.valueOf();
                eventLog.value = eventLog.value.div(Math.pow(10, baseUnit)).toFormat(baseUnit);
                callback(eventLog);
              });
            });
          });
        });
        resolve(listener);
      }
    });
  });
};
var transfersToICAPListener;
listenTransfersToICAP(function(log) {console.log(log);}).then(function(listener) {
  transfersToICAPListener = listener;
});
// transfersToICAPListener.stopWatching();