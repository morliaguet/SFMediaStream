ScarletsMedia.harmonizer = function(sourceNode){
	var context = this.audioContext;
	var output = context.createGain();
	var input = sourceNode === undefined ? context.createGain() : null;
	if(input) sourceNode = input;
  	var bands = 8;

	// Cascading 2 filters for sharp resonance.
    var filters1 = [];
    var filters2 = [];
    var gains = [];

    for (var i = 0; i < bands; ++i) {
      filters1[i] = context.createBiquadFilter();
      filters1[i].type = 'bandpass';
      filters2[i] = context.createBiquadFilter();
      filters2[i].type = 'bandpass';
      sourceNode.to(filters1[i]);

      gains[i] = context.createGain();
      gains[i].to(output);
      filters1[i].to(filters2[i]).to(gains[i]);
    }

    output.gain.value = 35.0;
    output.to(output);

	var ret = {
		// Connect to output
		// output.connect(context.destination);
		output:output,
		input:input,
		
		// Change frequency of filters
	    pitch: function (value, time, rampType) {
	    	var f0 = ScarletsMedia.convert.midiToFreq(value);
	    	for (var i = 0; i < bands; i++) {
	    		filters1[i].frequency.set(f0, time, rampType);
	    		filters2[i].frequency.set(f0, time, rampType);
	    	}
	    },

	    slope: function (value, time, rampType) {
	    	for (var i = 0; i < bands; i++) {
	    		gains[i].gain.set(1.0 + Math.sin(Math.PI + (Math.PI/2 * (value + i / bands))), time, rampType);
	    	}
	    },

	    width: function (value, time, rampType) {
	    	for (var i = 1; i < bands; i++) {
	    		var q = 2 + 90 * Math.pow((1 - i / bands), value);
	    		filters1[i].Q.set(q, time, rampType);
	    		filters2[i].Q.set(q, time, rampType);
	    	}
	    },

		// This should be executed to clean memory
		destroy:function(){
			gain.disconnect();
			output.disconnect();
			this.gain = gain = this.node = output = null;
		}
	};

    ret.pitch(34);
    ret.slope(0.65);
    ret.width(0.15);

	return ret;

	// sample
	// noise x0.25 -> harmonizer -> reverb x0.85
};