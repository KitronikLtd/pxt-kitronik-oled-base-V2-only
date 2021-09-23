////////////////////////////////
//  OLED - V2 MICRO:BIT ONLY  //
////////////////////////////////

namespace kitronik_OLED_V2 {
    /**
     * Select the alignment of text
     */
    export enum ShowAlign {
        //% block="Left"
        Left,
        //% block="Centre"
        Centre,
        //% block="Right"
        Right
    }

    /**
     * Select direction for drawing lines
     */
    export enum LineDirectionSelection {
        //% block="horizontal"
        horizontal,
        //% block="vertical"
        vertical
    }

    // ASCII Code to OLED 5x8 pixel character for display conversion
    // font[0 - 31] are non-printable
    // font[32 - 127]: SPACE ! " # $ % & ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~ DEL
    export const font = [0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x00000000, 0x000002e0, 0x00018060, 0x00afabea, 0x00aed6ea, 0x01991133, 0x010556aa, 0x00000060, 0x000045c0, 0x00003a20, 0x00051140, 0x00023880, 0x00002200, 0x00021080, 0x00000100, 0x00111110, 0x0007462e, 0x00087e40, 0x000956b9, 0x0005d629, 0x008fa54c, 0x009ad6b7, 0x008ada88, 0x00119531, 0x00aad6aa, 0x0022b6a2, 0x00000140, 0x00002a00, 0x0008a880, 0x00052940, 0x00022a20, 0x0022d422, 0x00e4d62e, 0x000f14be, 0x000556bf, 0x0008c62e, 0x0007463f, 0x0008d6bf, 0x000094bf, 0x00cac62e, 0x000f909f, 0x000047f1, 0x0017c629, 0x0008a89f, 0x0008421f, 0x01f1105f, 0x01f4105f, 0x0007462e, 0x000114bf, 0x000b6526, 0x010514bf, 0x0004d6b2, 0x0010fc21, 0x0007c20f, 0x00744107, 0x01f4111f, 0x000d909b, 0x00117041, 0x0008ceb9, 0x0008c7e0, 0x01041041, 0x000fc620, 0x00010440, 0x01084210, 0x00000820, 0x010f4a4c, 0x0004529f, 0x00094a4c, 0x000fd288, 0x000956ae, 0x000097c4, 0x0007d6a2, 0x000c109f, 0x000003a0, 0x0006c200, 0x0008289f, 0x000841e0, 0x01e1105e, 0x000e085e, 0x00064a4c, 0x0002295e, 0x000f2944, 0x0001085c, 0x00012a90, 0x010a51e0, 0x010f420e, 0x00644106, 0x01e8221e, 0x00093192, 0x00222292, 0x00095b52, 0x0008fc80, 0x000003e0, 0x000013f1, 0x00841080, 0x0022d422];

    // Constants for Display
    export let NUMBER_OF_CHAR_PER_LINE = 26

    // Default address for the display
    export let displayAddress = 60

    // Text alignment, defaulted to "Left"
    export let displayShowAlign = ShowAlign.Left

    // Plot variables
    let plotArray: number[] = []
    let plottingEnable = 0
    let plotData = 0;
    let graphYMin = 0
    let graphYMax = 100
    let graphRange = 100
    let GRAPH_Y_MIN_LOCATION = 63
    let GRAPH_Y_MAX_LOCATION = 20
    let previousYPlot = 0

    // Screen buffers for sending data to the display
    let screenBuf = pins.createBuffer(1025);
    let ackBuf = pins.createBuffer(2);
    let writeOneByteBuf = pins.createBuffer(2);
    let writeTwoByteBuf = pins.createBuffer(3);
    let writeThreeByteBuf = pins.createBuffer(4);
    let pageBuf = pins.createBuffer(129);

    export let initialised = 0         // Flag to indicate automatic initalisation of the display

    // Function to write one byte of data to the display
    function writeOneByte(regValue: number) {
        writeOneByteBuf[0] = 0;
        writeOneByteBuf[1] = regValue;
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf);
    }

    // Function to write two bytes of data to the display
    function writeTwoByte(regValue1: number, regValue2: number) {
        writeTwoByteBuf[0] = 0;
        writeTwoByteBuf[1] = regValue1;
        writeTwoByteBuf[2] = regValue2;
        pins.i2cWriteBuffer(displayAddress, writeTwoByteBuf);
    }

    // Function to write three bytes of data to the display
    function writeThreeByte(regValue1: number, regValue2: number, regValue3: number) {
        writeThreeByteBuf[0] = 0;
        writeThreeByteBuf[1] = regValue1;
        writeThreeByteBuf[2] = regValue2;
        writeThreeByteBuf[3] = regValue3;
        pins.i2cWriteBuffer(displayAddress, writeThreeByteBuf);
    }

    // Set the starting on the display for writing text
    export function set_pos(col: number = 0, page: number = 0) {
        writeOneByte(0xb0 | page) // page number
        writeOneByte(0x00 | (col % 16)) // lower start column address
        writeOneByte(0x10 | (col >> 4)) // upper start column address    
    }

    // Set the particular data byte on the screen for clearing
    function clearBit(d: number, b: number): number {
        if (d & (1 << b))
            d -= (1 << b)
        return d
    }

    /**
     * Setup the display ready for use (function on available in text languages, not blocks)
     */
    export function initDisplay(): void {
        // Load the ackBuffer to check if there is a display there before starting initalisation
        ackBuf[0] = 0
        ackBuf[1] = 0xAF
        let ack = pins.i2cWriteBuffer(displayAddress, ackBuf)
        if (ack == -1010) {      // If returned value back is -1010, there is no display so show error message
            basic.showString("ERROR - no display")
        }
        else {   // Start initalising the display
            writeOneByte(0xAE)              // SSD1306_DISPLAYOFF
            writeOneByte(0xA4)              // SSD1306_DISPLAYALLON_RESUME
            writeTwoByte(0xD5, 0xF0)        // SSD1306_SETDISPLAYCLOCKDIV
            writeTwoByte(0xA8, 0x3F)        // SSD1306_SETMULTIPLEX
            writeTwoByte(0xD3, 0x00)        // SSD1306_SETDISPLAYOFFSET
            writeOneByte(0 | 0x0)           // line #SSD1306_SETSTARTLINE
            writeTwoByte(0x8D, 0x14)        // SSD1306_CHARGEPUMP
            writeTwoByte(0x20, 0x00)        // SSD1306_MEMORYMODE
            writeThreeByte(0x21, 0, 127)    // SSD1306_COLUMNADDR
            writeThreeByte(0x22, 0, 63)     // SSD1306_PAGEADDR
            writeOneByte(0xa0 | 0x1)        // SSD1306_SEGREMAP
            writeOneByte(0xc8)              // SSD1306_COMSCANDEC
            writeTwoByte(0xDA, 0x12)        // SSD1306_SETCOMPINS
            writeTwoByte(0x81, 0xCF)        // SSD1306_SETCONTRAST
            writeTwoByte(0xd9, 0xF1)        // SSD1306_SETPRECHARGE
            writeTwoByte(0xDB, 0x40)        // SSD1306_SETVCOMDETECT
            writeOneByte(0xA6)              // SSD1306_NORMALDISPLAY
            writeTwoByte(0xD6, 0)           // Zoom is set to off
            writeOneByte(0xAF)              // SSD1306_DISPLAYON
            initialised = 1
            clear_Base()
        }
    }

    // Using (x, y) coordinates, turn on a selected pixel on the screen.
    export function setPixel_Base(x: number, y: number) {
        let page = y >> 3
        let shift_page = y % 8                                  // Calculate the page to write to
        let ind = x + page * 128 + 1                            // Calculate which register in the page to write to
        let screenPixel = (screenBuf[ind] | (1 << shift_page))  // Set the screen data byte
        screenBuf[ind] = screenPixel                            // Store data in screen buffer
        set_pos(x, page)                                        // Set the position on the screen to write at 
        writeOneByteBuf[0] = 0x40                               // Load buffer with command
        writeOneByteBuf[1] = screenPixel                        // Load buffer with byte
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf)    // Send data to screen
    }

    // Using the (x, y) coordinates, clear a selected pixel on the screen.
    export function clearPixel_Base(x: number, y: number) {
        let page2 = y >> 3
        let shift_page2 = y % 8                                     // Calculate the page to write to
        let ind2 = x + page2 * 128 + 1                              // Calculate which register in the page to write to
        let screenPixel2 = clearBit(screenBuf[ind2], shift_page2)   // Clear the screen data byte
        screenBuf[ind2] = screenPixel2                              // Store data in screen buffer
        set_pos(x, page2)                                           // Set the position on the screen to write at 
        writeOneByteBuf[0] = 0x40                                   // Load buffer with command
        writeOneByteBuf[1] = screenPixel2                           // Load buffer with byte
        pins.i2cWriteBuffer(displayAddress, writeOneByteBuf)        // Send data to screen
    }

    // 'show' allows any number, string or variable to be displayed on the screen.
    // The line and justification (Left, Centre or Right) can be set.
    export function show_Base(inputData: any, line: number, displayShowAlign: ShowAlign) {
        let y = 0
        let x = 0
        let inputString = convertToText(inputData)
        inputString = inputString + " "

        // If text alignment has not been specified, default to "Left"
        if (!displayShowAlign) {
            displayShowAlign = ShowAlign.Left
        }

        // If the screen line has not bee specified, default to top line (i.e. y = 0)
        // Otherwise, subtract '1' from the line number to return correct y value
        if (!line) {
            y = 0
        }
        else {
            y = (line - 1)
        }

        // Sort text into lines
        let stringArray: string[] = []
        let numberOfStrings = 0

        let previousSpacePoint = 0
        let spacePoint = 0
        let startOfString = 0
        let saveString = ""
        if (inputString.length > NUMBER_OF_CHAR_PER_LINE) {
            if (y == 7) {
                stringArray[numberOfStrings] = inputString.substr(0, (NUMBER_OF_CHAR_PER_LINE - 1))
                numberOfStrings = 1
            }
            else {
                for (let spaceFinder = 0; spaceFinder <= inputString.length; spaceFinder++) {
                    if (inputString.charAt(spaceFinder) == " ") {                                // Check whether the charector is a space, if so...
                        spacePoint = spaceFinder                                                // Remember the location of the new space found
                        if ((spacePoint - startOfString) < NUMBER_OF_CHAR_PER_LINE) {            // Check if the current location minus start of string is less than number of char on a screen
                            previousSpacePoint = spacePoint                                     // Remember that point for later
                            if (spaceFinder == (inputString.length - 1)) {
                                saveString = inputString.substr(startOfString, spacePoint)      // Cut the string from start of word to the last space and store it
                                stringArray[numberOfStrings] = saveString
                                numberOfStrings += 1
                            }
                        }
                        else if ((spacePoint - startOfString) > NUMBER_OF_CHAR_PER_LINE) {       // Check if the current location minus start of string is greater than number of char on a screen
                            saveString = inputString.substr(startOfString, previousSpacePoint)  // Cut the string from start of word to the last space and store it
                            stringArray[numberOfStrings] = saveString
                            startOfString = previousSpacePoint + 1                              // Set start of new word from last space plus one position
                            numberOfStrings += 1                                                // Increase the number of strings variable
                        }
                        else if ((spacePoint - startOfString) == NUMBER_OF_CHAR_PER_LINE) {      // Check if the current location minus start of string equals than number of char on a screen
                            saveString = inputString.substr(startOfString, spacePoint)
                            stringArray[numberOfStrings] = saveString
                            startOfString = spacePoint + 1
                            previousSpacePoint = spacePoint
                            numberOfStrings += 1
                        }
                    }
                }
            }
        }
        else {
            stringArray[numberOfStrings] = inputString
            numberOfStrings += 1
        }

        let col = 0
        let charDisplayBytes = 0
        let ind = 0

        // Set text alignment, fill up the screenBuffer with data and send to the display
        for (let textLine = 0; textLine <= (numberOfStrings - 1); textLine++) {
            let displayString = stringArray[textLine]

            if (inputString.length < (NUMBER_OF_CHAR_PER_LINE - 1)) {
                if (displayShowAlign == ShowAlign.Left) {
                    x = 0
                }
                else if (displayShowAlign == ShowAlign.Centre) {
                    x = Math.round((NUMBER_OF_CHAR_PER_LINE - displayString.length) / 2)
                }
                else if (displayShowAlign == ShowAlign.Right) {
                    x = (NUMBER_OF_CHAR_PER_LINE - displayString.length - 1) + textLine
                }
            }

            for (let charOfString = 0; charOfString < displayString.length; charOfString++) {
                charDisplayBytes = font[displayString.charCodeAt(charOfString)]
                for (let k = 0; k < 5; k++) {  // 'for' loop will take byte font array and load it into the correct register, then shift to the next byte to load into the next location
                    col = 0
                    for (let l = 0; l < 5; l++) {
                        if (charDisplayBytes & (1 << (5 * k + l)))
                            col |= (1 << (l + 1))
                    }

                    ind = (x + charOfString) * 5 + y * 128 + k + 1
                    screenBuf[ind] = col
                }
            }
            set_pos(x * 5, y)                               // Set the start position to write to
            let ind02 = x * 5 + y * 128
            let buf2 = screenBuf.slice(ind02, ind + 1)
            buf2[0] = 0x40
            pins.i2cWriteBuffer(displayAddress, buf2)       // Send data to the screen
            y += 1
        }
    }

    // Clear a specific line on the screen (1 to 8).
    export function clearLine_Base(line: number) {
        let y = 0
        let x = 0

        // Subtract '1' from the line number to return correct y value
        //y = (line - 1)
        // This method is not quite working properly - the line clears but the content is still held in screen buffer so comes back if the display is refreshed
        //set_pos(0, y)                               // Set the start position to write to (page addressing mode)
        //pageBuf.fill(0)
        //pageBuf[0] = 0x40
        //pins.i2cWriteBuffer(displayAddress, pageBuf)       // Send data to the screen

        show_Base("                          ", line, ShowAlign.Left) // Write 26 spaces to the selected line to clear it
    }

    // Draw a line of a specific length in pixels, using the (x, y) coordinates as a starting point.
    export function drawLine_Base(lineDirection: LineDirectionSelection, len: number, x: number, y: number) {
        if (lineDirection == LineDirectionSelection.horizontal) {
            for (let hPixel = x; hPixel < (x + len); hPixel++)      // Loop to set the pixels in the horizontal line
                setPixel_Base(hPixel, y)
        }
        else if (lineDirection == LineDirectionSelection.vertical) {
            if (len >= 64) {          // For horizontal, 'len' can be max of 127 (full x-axis), but vertical only allowed to be max of 63 (full y-axis)
                len = 63
            }
            for (let vPixel = y; vPixel < (y + len); vPixel++)      // Loop to set the pixels in the vertical line
                setPixel_Base(x, vPixel)
        }
    }

    // Draw a rectangle with a specific width and height in pixels, using the (x, y) coordinates as a starting point.
    export function drawRect_Base(width: number, height: number, x: number, y: number) {
        if (!x) {    // If variable 'x' has not been used, default to x position of 0
            x = 0
        }

        if (!y) {    // If variable 'y' has not been used, default to y position of 0
            y = 0
        }

        // Draw the lines for each side of the rectangle
        drawLine_Base(LineDirectionSelection.horizontal, width, x, y)
        drawLine_Base(LineDirectionSelection.horizontal, width, x, ((y + height) - 1))
        drawLine_Base(LineDirectionSelection.vertical, height, x, y)
        drawLine_Base(LineDirectionSelection.vertical, height, ((x + width) - 1), y)
    }

    // Clear all pixels, text and images on the screen.
    export function clear_Base() {
        screenBuf.fill(0)       // Fill the screenBuf with all '0'
        screenBuf[0] = 0x40
        set_pos()               // Set position to the start of the screen
        pins.i2cWriteBuffer(displayAddress, screenBuf)  // Write clear buffer to the screen
    }

    // Turn the screen on and off. The information on the screen will be kept when it is off, ready to be displayed again.
    export function controlDisplayOnOff_Base(displayOutput: boolean) {
        if (displayOutput == true) {
            writeOneByte(0xAF)      // Turn display output on
        }
        else {
            writeOneByte(0xAE)      // Turn display output off
        }
    }

    //////////////////////////////////////
    //
    //      Plotting blocks
    //
    //////////////////////////////////////

    // Start plotting a live graph of the chosen variable or input on the screen.
    export function plot_Base(plotVariable: number) {
        let plotLength = plotArray.length
        if (plotLength == 127) {     // If the length of the array has reached the max number of pixels, shift the array and remove the oldest value
            plotArray.shift()
        }
        // Round the variable to use ints rather than floats
        plotVariable = Math.round(plotVariable)
        // Add the value to the end of the array
        plotArray.push(plotVariable)

        // If the variable exceeds the scale of the y axis, update the min or max limits
        if (plotVariable > graphYMax)
            graphYMax = plotVariable
        if (plotVariable < graphYMin)
            graphYMin = plotVariable

        // 'for' loop plots the graph on the display
        for (let arrayPosition = 0; arrayPosition <= plotLength; arrayPosition++) {
            let x3 = arrayPosition  // Start of the screen (x-axis)
            let yPlot = plotArray[arrayPosition]
            // Map the variables to scale between the min and max values to the min and max graph pixel area
            yPlot = pins.map(yPlot, graphYMin, graphYMax, GRAPH_Y_MIN_LOCATION, GRAPH_Y_MAX_LOCATION)

            if (arrayPosition == 0) {
                previousYPlot = yPlot
            }
            let y3 = 0
            let len = 0

            // Determine if the line needs to be drawn from the last point to the new or visa-versa (vertical lines can only be drawn down the screen)
            if (yPlot < previousYPlot) {
                y3 = yPlot
                len = (previousYPlot - yPlot)
            }
            else if (yPlot > previousYPlot) {
                y3 = previousYPlot
                len = (yPlot - previousYPlot)
            }
            else {
                y3 = yPlot
                len = 1
            }

            // Clear plots in screenBuffer
            let page3 = 0
            for (let pixel = GRAPH_Y_MAX_LOCATION; pixel <= GRAPH_Y_MIN_LOCATION; pixel++) {
                page3 = pixel >> 3
                let shift_page3 = pixel % 8
                let ind5 = x3 + page3 * 128 + 1
                let screenPixel3 = clearBit(screenBuf[ind5], shift_page3)   // Clear the screen data byte
                screenBuf[ind5] = screenPixel3                              // Store data in screenBuffer
            }

            // Plot new data in screenBuffer
            for (let pixel = y3; pixel < (y3 + len); pixel++) {
                page3 = pixel >> 3
                let shift_page4 = pixel % 8
                let ind6 = x3 + page3 * 128 + 1
                let screenPixel4 = (screenBuf[ind6] | (1 << shift_page4))   // Set the screen data byte
                screenBuf[ind6] = screenPixel4                              // Store data in screen buffer
            }
            previousYPlot = yPlot
        }
        refresh_Base() // Refresh screen with new data in screenBuffer
    }

    //////////////////////////////////////
    //
    //      Expert blocks
    //
    //////////////////////////////////////

    // Update or refresh the screen if any data has been changed.
    export function refresh_Base() {
        set_pos()
        pins.i2cWriteBuffer(displayAddress, screenBuf)
    }

    // Invert the colours on the screen (black to white, white to black)
    export function invert_Base(output: boolean) {
        let invertRegisterValue = 0

        if (output == true) {
            invertRegisterValue = 0xA7
        }
        else {
            invertRegisterValue = 0xA6
        }
        writeOneByte(invertRegisterValue)
    }
}