# o2-speak-text

[![Build Status](https://travis-ci.org/novelsphere/o2-speak-text.svg?branch=master)](https://travis-ci.org/novelsphere/o2-speak-text)

Play Japanese vowels sound as they display

- Only works for Japanese
- Sound files are not included, please see the `prefix` attribute for details
- Used in [Ghostpia](http://ghostpia.xyz)

文字を表示しながら母音のサウンドを再生するプラグイン。

- 例えば「こんにちは」を表示すると「おんいいあ」の音が再生されます
- 音声は含まれてないので自分で準備してください、詳細は `prefix` 属性をみてください
- [Ghostpia](http://ghostpia.xyz) で使われてる

## Usage 使い方

- Download `speak-text.js`

- Move the file to your project's plugin folder

- Add this to the beginning of your `first.ks`
  ```
  [o2_loadplugin module="speak-text.js"]
  ```

- Enable it like this
  ```
  [speaktext enable=true]
  ```

- Disable
  ```
  [speaktext enable=false]
  ```

------

- `speak-text.js` をダウンロード

- ファイルをプロジェクトの plugin フォルダーに移動

- `first.ks` の最初にこれを追加

  ```
  [o2_loadplugin module="speak-text.js"]
  ```

- こういう風に起動する

  ```
  [speaktext enable=true]
  ```

- 停止する

  ```
  [speaktext enable=false]
  ```

------

### Tag Reference タグリファレンス

#### [speaktext] attributes

- enable
  - true | false
  - Enable vowels
  - 母音を喋るのを有効にする

- prefix
  - This specify where to look for sound files, default is `voice0`
  - It looks for the following sound file for the following vowels
    - a : prefix + '1'
    - i : prefix + '2'
    - u : prefix + '3'
    - e : prefix + '4'
    - o : prefix + '5'
    - other : prefix + '6'
  - For example when prefix is `voice0`, and 「い」 is displayed, voice01 will be played
  - どこから音声ファイルをロードするかを指定する
  - 文字が表示されたら、このルールで再生する音声を探す
    - a : prefix + '1'
    - i : prefix + '2'
    - u : prefix + '3'
    - e : prefix + '4'
    - o : prefix + '5'
    - その他 : prefix + '6'
  - 例えば prefix が `voice0` なら、「い」が表示されたら `voice01` が再生されます

- ignore_skip
  - true | false
  - Should it speaks text displayed in skip mode
  - スキップしてる時喋るのか？