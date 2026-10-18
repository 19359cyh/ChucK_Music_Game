__BPM__.0 => float bpm;
60.0 / bpm => float quarterNote;
quarterNote :: second => dur Q;
quarterNote * __E_BEATS__ :: second => dur E;
quarterNote * __H_BEATS__ :: second => dur H;

[
    69, 74, 79, 78, 76, 78, 76, 71,
    76, 74, 73, 71, 71, 69, 0, 69,
    74, 81, 88, 79, 78, 76, 0, 74,
    73, 69, 74, 79, 78, 76, 78, 76,
    71, 76, 74, 73, 73, 71, 71, 69,
    62, 66, 73, 74, 81, 83, 0, 74,
    79, 78, 74, 76, 0, 55, 59, 62,
    61, 0, 64, 67
] @=> int rhNotes[];

[
    E, E, E, E, E, E, E, E,
    E, E, E, E, E, E, E, E,
    E, E, E, E, E, E, E, E,
    E, E, E, E, E, E, E, E,
    E, E, E, E, E, E, E, E,
    E, E, E, E, E, E, E, E,
    E, E, E, E, E, E, E, E,
    E, E, E, E
] @=> dur rhDurs[];

[
    50, 57, 50, 57, 50, 57, 50, 57,
    55, 57, 55, 57, 55, 57, 55, 57,
    50, 57, 50, 57, 50, 57, 50, 57,
    50, 62, 50, 62, 50
] @=> int lhNotes[];

[
    Q, Q, Q, Q, Q, Q, Q, Q,
    Q, Q, Q, Q, Q, Q, Q, Q,
    Q, Q, Q, Q, Q, Q, Q, Q,
    Q, Q, Q, Q, H
] @=> dur lhDurs[];

fun void playRightHand()
{
    Violin rh => Pan2 rhPan => dac;
    __RIGHT_PAN__ => rhPan.pan;
    rh.__RIGHT_SOUND__();

    for (0 => int i; i < rhNotes.cap(); i++)
    {
        if (rhNotes[i] == 0)
        {
            rhDurs[i] => now;
        }
        else
        {
            Std.mtof(rhNotes[i]) => rh.freq;
            rh.noteOn(0.2);
            rhDurs[i] * 0.8 => now;
            rh.noteOff(0.2);
            rhDurs[i] * 0.2 => now;
        }
    }
}

fun void playLeftHand()
{
    Bass lh => Pan2 lhPan => dac;
    __LEFT_PAN__ => lhPan.pan;
    lh.__LEFT_SOUND__();

    for (0 => int i; i < lhNotes.cap(); i++)
    {
        if (lhNotes[i] == 0)
        {
            lh.setGain(0.0);
            lhDurs[i] => now;
        }
        else
        {
            lh.setGain(0.4);
            lh.freq(Std.mtof(lhNotes[i]));
            lhDurs[i] * 0.8 => now;
            lh.setGain(0.0);
            lhDurs[i] * 0.2 => now;
        }
    }
}

fun void playDrum()
{
    Drum drum => Pan2 drumPan => dac;
    __DRUM_PAN__ => drumPan.pan;
    drum.__DRUM_SOUND__();

    while (true)
    {
        drum.hit(70.0, 0.8);
        (Q * 2) - 0.08::second => now;
        drum.hit(55.0, 0.6);
        (Q * 2) - 0.08::second => now;
    }
}

spork ~ playDrum();

while (true)
{
    spork ~ playRightHand();
    spork ~ playLeftHand();
    __LOOP_BEATS__ * quarterNote :: second => now;
}
