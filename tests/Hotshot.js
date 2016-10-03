'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Hotshot = function () {
  function Hotshot(_ref) {
    var _this = this;

    var waitForInputTime = _ref.waitForInputTime;
    var seqs = _ref.seqs;
    var combos = _ref.combos;

    _classCallCheck(this, Hotshot);

    this._seqs = seqs || [];
    this._combos = combos || [];
    this._pressedSeqKeys = '';
    this._pressedComboKeys = [];
    this._waitForInputTime = waitForInputTime || 500;

    //bind key events
    document.addEventListener('keyup', function (_ref2) {
      var keyCode = _ref2.keyCode;

      _this._handleKeyUpSeq(keyCode);
      _this._handleKeyUpCombo(keyCode);
    }, false);

    document.addEventListener('keydown', function (_ref3) {
      var keyCode = _ref3.keyCode;
      var metaKey = _ref3.metaKey;

      _this._handleKeyDownCombo(keyCode, metaKey);
    }, false);
  }

  _createClass(Hotshot, [{
    key: 'bindSeq',
    value: function bindSeq(keyCodes, callback) {
      this._seqs.push({
        keyCodes: keyCodes,
        callback: callback
      });
    }
  }, {
    key: 'bindCombo',
    value: function bindCombo(keyCodes, callback) {
      this._combos.push({
        keyCodes: keyCodes,
        callback: callback
      });
    }
  }, {
    key: '_rmItemFromArr',
    value: function _rmItemFromArr(item, arr) {
      var idx = arr.indexOf(item);

      if (idx !== -1) {
        arr.splice(idx, 1);
      }
    }
  }, {
    key: '_handleKeyUpCombo',
    value: function _handleKeyUpCombo(keyCode) {
      this._rmItemFromArr(keyCode, this._pressedComboKeys);
    }
  }, {
    key: '_handleKeyDownCombo',
    value: function _handleKeyDownCombo(keyCode, metaKey) {
      var _this2 = this;

      if (!this._pressedComboKeys.includes(keyCode)) {
        this._pressedComboKeys.push(keyCode);

        if (metaKey) {
          setTimeout(function () {
            _this2._rmItemFromArr(keyCode, _this2._pressedComboKeys);
          }, this._waitForInputTime);
        }
      }

      //check pressed keys against config
      var match = this._checkCombosForPressedKeys();

      if (match) {
        match.callback();
      }
    }
  }, {
    key: '_checkCombosForPressedKeys',
    value: function _checkCombosForPressedKeys() {
      var combos = this._combos;
      var pressedComboKeys = this._pressedComboKeys;
      var match = null;

      combos.forEach(function (_ref4) {
        var keyCodes = _ref4.keyCodes;
        var callback = _ref4.callback;

        var keyCodesStr = keyCodes.join('');
        var pressedComboKeysStr = pressedComboKeys.join('');

        if (keyCodesStr === pressedComboKeysStr) {
          //match found
          match = { keyCodes: keyCodes, callback: callback };
        }
      });

      return match;
    }
  }, {
    key: '_resetWaitInputTimer',
    value: function _resetWaitInputTimer(callback) {
      var _this3 = this;

      var waitTime = arguments.length <= 1 || arguments[1] === undefined ? this._waitForInputTime : arguments[1];

      //wait for user input for x amount of time
      //if there is no user input
      //reset the pressed keys register and trigger
      //the optional callback

      clearTimeout(this._waitInputTimer);
      this._waitInputTimer = setTimeout(function () {
        _this3._pressedSeqKeys = '';
        if (typeof callback === 'function') {
          callback();
        }
      }, waitTime);
    }
  }, {
    key: '_checkSeqsForPressedKeys',
    value: function _checkSeqsForPressedKeys() {
      var seqs = this._seqs;
      var pressedSeqKeys = this._pressedSeqKeys;

      var match = null;
      var shouldWait = false;

      //loop all key seqs and
      //check if the register matches one of the codes
      seqs.forEach(function (_ref5) {
        var keyCodes = _ref5.keyCodes;
        var callback = _ref5.callback;

        var codeStr = keyCodes.join('');

        if (pressedSeqKeys === codeStr) {
          //pressed keys match config code
          //wait for next input
          //if there is no next input, trigger callback
          match = { keyCodes: keyCodes, callback: callback };
        } else if (codeStr.indexOf(pressedSeqKeys) === 0) {
          //if there is a shortcut
          //registered with more chars that starts with this
          //(e.g. user pressed gs but there is also gsp)
          //then give user time to press the next key
          shouldWait = true;
        }
      });

      return {
        match: match,
        shouldWait: shouldWait
      };
    }
  }, {
    key: '_handleKeyUpSeq',
    value: function _handleKeyUpSeq(keyCode) {
      //register pressed key
      this._pressedSeqKeys += keyCode;

      //check pressed keys against config

      var _checkSeqsForPressedK = this._checkSeqsForPressedKeys();

      var match = _checkSeqsForPressedK.match;
      var shouldWait = _checkSeqsForPressedK.shouldWait;


      if (match) {
        //keys match found
        if (shouldWait) {
          this._resetWaitInputTimer(match.callback);
        } else {
          this._resetWaitInputTimer(match.callback, 0);
        }
      } else {
        //if no match was found yet
        //reset timer so the pressed keys are
        //reset if there is no more user input
        this._resetWaitInputTimer();
      }
    }
  }]);

  return Hotshot;
}();

window.Hotshot = Hotshot;