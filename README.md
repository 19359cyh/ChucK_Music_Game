## 資訊科學與數位生活Information Science and Digital Life
### 網頁遊戲

dac是音效卡<br>
=>            //輸出<br>
=<            //拔掉<br>
44100<br>



60是C4<br>
Std.rand2(0, 3) * 12 高八度*3<br>
hi[Std.rand2(0, hi.cap()-1)] 隨機選擇音階<br>
180::ms => now; 每180毫秒產生一個音符<br>

sinOse 正弦<br>
PulseOse 方波<br>
SqrOse<br>
TriOse<br>
SawOse 鋸齒波<br>
Noise 白噪音<br>
Impulse 脈衝波<br>
Step 一次到頂<br>

adc：收音的麥克風<br>
Gain：擴大機<br>
Pan2：調參數會偏左右（音場）<br>
ADSR：無聲到有聲、聲音持續多久、跟原振幅比值、聲音慢慢消失過程時間（四個值）<br>

PitShift：調變頻率<br>
delay可以做回音<br>
NRev：回聲<br>

### if 有 sample
（記得放對路徑）<br>
（只能放wav）<br>

me.dir：本檔案<br>
mySound.read：讀入<br>
mySound.pos：從音檔哪開始放<br>
mySound.rate：速度<br>
mySound.Sample() => int numSamples; 抓樣本數<br>
numSamples -1 => mySound.pos：倒放<br>