/**
 * Copyright (c) 2010 Jakob Westhoff
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function( window ){
    var pack = function( format /*, arguments ... */ ) {
        var i = 0,
            instructions = [],
            byteSequence = [],
            byteString = "";
            match = null,
            currentInstruction = null,
            currentArgument = null,
            currentMultiplier = null,
            args = Array.prototype.slice.call( arguments, 1 ),
            formats = {};

            formats["a"] = function( argument, cycle ) {
                return [argument.charCodeAt( cycle ) || 32];
            };
            formats["A"] = function( argument, cycle ) {
                return [argument.charCodeAt( cycle ) || 0];
            };
            formats["c"] = formats["C"] = function( argument, cycle ) {
                return [argument];
            };
            formats["s"] = formats["S"] = formats["v"] = function( argument, cycle ) {
                return [
                    argument & 0xff,
                    argument >> 8 & 0xff
                ];
            };
            formats["n"] = function( argument, cycle ) {
                return [
                    argument >> 8 & 0xff,
                    argument & 0xff
                ];
            };
            formats["i"] = formats["I"] = formats["l"] = formats["L"] = formats["V"] = function( argument, cycle ) {
                return [
                    argument & 0xff,
                    argument >> 8 & 0xff,
                    argument >> 16 & 0xff,
                    argument >> 24 & 0xff
                ];
            };
            formats["N"] = function( argument, cycle ) {
                return [
                    argument >> 24 & 0xff,
                    argument >> 16 & 0xff,
                    argument >> 8 & 0xff,
                    argument & 0xff
                ];
            };

        while( ( match = format.match(/([A-Za-z])([0-9*]+)?/) ) ) {
            instructions.push({
                'instruction': match[1],
                'multiplier': match[2] || 1
            });
            format = format.substr( match[0].length );
        }
             
        while( ( currentInstruction = instructions.shift() ) ) {
                if ( formats[currentInstruction.instruction] === undefined ) {
                    throw "PACK Exception: Unknown format '" + currentInstruction.instruction + "'";
                }

                currentArgument = args.shift();

                currentMultiplier = ( currentInstruction.multiplier != "*" )
                                  ? ( currentInstruction.multiplier )
                                  : ( ( currentInstruction.instruction == 'a' || currentInstruction.instruction == 'A' )
                                    ? ( currentArgument.length )
                                    : ( args.length + 1 ) );

                for( i=0; i<currentMultiplier; ++i ) {
                    byteSequence = byteSequence.concat( 
                        formats[currentInstruction.instruction]( currentArgument, i )
                    );
                    
                    if ( i<currentMultiplier - 1 ) {
                        currentArgument = ( currentInstruction.instruction == "a" || currentInstruction.instruction == "A" )
                                        ? currentArgument
                                        : args.shift();
                    }
                }
        }

        if ( instructions.length != 0 ) {
            throw "PACK Exception: Too many arguments for this format string.";
        }

        for( i=0; i<byteSequence.length; ++i ) {
            byteString += String.fromCharCode( byteSequence[i] );
        }

        return byteString;
    }

    window.pack = pack;
})( window );
