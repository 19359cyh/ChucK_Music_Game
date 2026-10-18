public class Violin extends Chugraph{ 
    SinOsc vib => SawOsc viol => ADSR env => ResonZ filt => outlet;
 
    fun void setViolin()
    {
        (0.5::second, 0.1::second, 0.6, 0.5::second) => env.set;

        8.0 => vib.freq;
        10.0 => vib.gain;
        440.0 => viol.freq;
        2 => viol.sync;	    

        440.0 => filt.freq;
        0.5 => filt.Q;     
    }   
    fun void freq(float f)
    {
        f => viol.freq;
        f => filt.freq; 
    }    
    fun void noteOn(float g)
    {
        g => outlet.gain;
        1 => env.keyOn;
    }   
    fun void noteOff(float g)
    {
        g => outlet.gain;
        1 => env.keyOff;
    }
}

public class Bass extends Chugraph
{
    SinOsc osc => ADSR env => LPF filter => outlet;
\
    fun void setBass()
    {
        (0.02::second, 0.1::second, 0.7, 0.15::second) => env.set;
        200 => filter.freq;
        1.5 => osc.gain;
    }

    fun void freq(float f)
    {
        f => osc.freq;
    }

    fun void setGain(float value)
    {
        value => outlet.gain;

        if (value > 0.0)
        {
            1 => env.keyOn;
        }
        else
        {
            1 => env.keyOff;
        }
    }
}

public class Drum extends Chugraph
{
    SinOsc osc => ADSR env => LPF filter => outlet;

    fun void setDrum()
    {
        (0.001::second, 0.08::second, 0.0, 0.08::second) => env.set;
        180 => filter.freq;
        2.0 => osc.gain;
    }

    fun void hit(float f, float volume)
    {
        f => osc.freq;
        volume => outlet.gain;
        1 => env.keyOn;
        0.08::second => now;
        1 => env.keyOff;
    }
}
    