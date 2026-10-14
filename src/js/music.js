import { Chuck } from 'webchuck'

// Create the default ChucK object
const theChuck = await Chuck.init([]);

// Run ChucK code
theChuck.runCode(`
    SinOsc foo => NRev r => dac; //建立正弦波振盪器，產生純音。把正弦波接到混響效果器 NRev。把混響後的聲音輸出到電腦音效卡。
    .4 => foo.gain; //音量
    .1 => r.mix;   //混音比例
    [0, 1, 4, 5, 7] @=> int hi[]; //[0, 2, 4, 5, 7, 9]Do, Re, Mi, Fa, Sol, La

    while(true)
    {
        Std.mtof(60 + Std.rand2(0, 3) * 12  +  hi[Std.rand2(0, hi.cap()-1)]) => foo.freq;
        180::ms => now;
    }
    // 60是C4
    // Std.rand2(0, 3) * 12 高八度*3
`);