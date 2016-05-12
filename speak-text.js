/* global $ o2 browser ResourceLoader MessageLayer Tag TagAction */
(function() {

	function BufferLoader(context, urlList, callback) {
		this.context = context;
		this.urlList = urlList;
		this.onload = callback;
		this.bufferList = new Array();
		this.loadCount = 0;
	}

	BufferLoader.prototype.loadBuffer = function(url, index) {
		// Load buffer asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var loader = this;

		request.onload = function() {
		// Asynchronously decode the audio file data in request.response
			loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					alert('error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if (++loader.loadCount == loader.urlList.length) {
					loader.onload(loader.bufferList);
				}
			},
			function(error) {
				console.error('decodeAudioData error', error);
			});
		};

		request.onerror = function() {
			alert('BufferLoader: XHR error');
		};

		request.send();
	};

	BufferLoader.prototype.load = function() {
		for (let i = 0; i < this.urlList.length; ++i)
			this.loadBuffer(this.urlList[i], i);
	};


	var vowels = {
		a : 'あかさたなはまやらわアカサタナハマヤラワがざだばぱガザダバパぁゃゎァャヮ',
		i : 'いきしちにひみりイキシチニヒミリぎじぢびぴギジチビピぃィ',
		u : 'うくすつぬふむゆるウクスツヌフムユルぐずづぶぷグズヅブプヴぅゥゅュ',
		e : 'えけせてねへめれエケセテネヘメレげぜでべぺゲゼデベペぇェ',
		o : 'おこそとのほもよろをオコソトノホモヨロヲごぞどぼぽゴゾドボポぉょォョ',
		slient : 'っッ・！？、。（）…―「」『』　'
	};

	function getVowel(char) {
		for (var key in vowels) {
			if (vowels[key].indexOf(char) >= 0) {
				return key;
			}
		}
		return 'n'; // default: ん
	}

	var audioManager = (function() {
		var AudioContext;
		if (AudioContext = window.AudioContext || window.webkitAudioContext) { //eslint-disable-line no-cond-assign
			var context = new AudioContext();
			var buffers = {};

			if ((browser.isIOs || browser.isAndroid) && !window.nativeInjected) {
				$('body').one('touchstart', function(e) {
					audioManager.playDummy();
				});
			}

			return {
				playAudio : function(key) {
					var buffer = buffers[ key ];
					if (!buffer) return;
					var source = context.createBufferSource();
					source.buffer = buffer;
					source.connect(context.destination);
					source.start(0);
					source.onended = function() {
						source.onended = undefined;
						source.disconnect();
					};
				},
				loadAudio : function(audios) {
					var keys = Object.keys(audios),
						defer = $.Deferred();
					var bufferLoader = new BufferLoader(
						context,
						keys.map(function(key) {
							return ResourceLoader.getFullAudioPath(audios[key]);
						}),
						function(bufferList) {
							for (let i = 0; i < bufferList.length; i++) {
								buffers[keys[i]] = bufferList[i];
							}
							defer.resolve();
						}
					);

					bufferLoader.load();
					return defer.promise();
				},
				playDummy : function() {
					var source = context.createBufferSource();
					source.connect(context.destination);
					source.start(0);
				}
			};
		}

		var audioCache = {};
		return {
			loadAudio : function(audios) {
				var defers = [];
				for (var key in audios) {
					audioCache[key] = new Audio();
					defers.push(ResourceLoader.loadAudio(audios[key], false, audioCache[key]));
				}
				return $.when.apply($, defers);
			},
			playAudio : function(key) {
				var audio = audioCache[key];
				if (!audio || audio.readyState == 0) return;
				audio.currentTime = 0;
				audio.play();
			}
		};
	})();

	var allDone = $.Deferred();
	var currentPrefix = undefined;
	function prepareAudioCache(prefix) {
		if (!currentPrefix || currentPrefix != prefix) {
			currentPrefix = prefix;
			allDone = audioManager.loadAudio({
				'a' : prefix + '1',
				'i' : prefix + '2',
				'u' : prefix + '3',
				'e' : prefix + '4',
				'o' : prefix + '5',
				'n' : prefix + '6'
			});
		}
		return allDone;
	}
	prepareAudioCache('voice0');

	MessageLayer.textCustomizers.speakTextCustomizer = function(textLayer, oldTexts, newTexts) {
		var maxIndex = -1;
		this.perform = function() {
			for (let i = 0; i < newTexts.length; i++) {
				var thisText = newTexts[i];
			// newTexts.forEach(function( thisText, index ){
				if (!thisText.styles.visible || thisText.styles.opacity == 0) continue;
				if (i <= maxIndex) continue;
				if (ignoreSkip && o2.skipMode != o2.SKIP_MODE_NONE) continue;

				var vowel = getVowel(thisText.text);
				audioManager.playAudio(vowel);
				maxIndex = i;
			}
		};
	};

	let ignoreSkip = false;

	Tag.actions.speaktext = new TagAction({
		rules : {
			enable : {type:"BOOLEAN"},
			ignore_skip : {type:"BOOLEAN"},
			prefix : {type:"STRING"}
		},
		action : function(args) {
			let index = o2.currentMessageLayer.textCustomizers.indexOf('speakTextCustomizer');

			if ('ignore_skip' in args) {
				ignoreSkip = args.ignore_skip;
			}

			var _this = this;
			if ('enable' in args) {
				if (args.enable) {
					if (index == -1) {
						o2.currentMessageLayer.textCustomizers.push('speakTextCustomizer');

						prepareAudioCache('prefix' in args ? args.prefix : 'voice0')
						.done(function() {
							setTimeout(function() {
								_this.done();
							});
						});
						return 1;
					}
				} else {
					if (index != -1) {
						o2.currentMessageLayer.textCustomizers.splice(index, 1);
					}
				}
			}

			if (args.prefix) {
				prepareAudioCache(args.prefix).done(function() {
					setTimeout(function() {
						_this.done();
					});
				});
				return 1;
			}

			return 0;
		}
	});
})();