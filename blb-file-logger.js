const { throws } = require('assert');

module.exports = function (RED) {
    var handle_error = function(err, node) {
        node.log(err.body);
        node.status({fill: "red", shape: "dot", text: err.message});
        node.error(err.message);
    };

    var fs = require('fs');
    var path = require('path');


    function BLBLogConfNode(n) {
        RED.nodes.createNode(this,n);
        this.dir = n.dir;
        this.filename = n.filename;
        this.dateinfilename = n.dateinfilename;
        this.includetimestamp = n.includetimestamp;
        this.retentiondays = n.retentiondays;
        this.retentionTimer = null;
        const retentionTimerInterval = 3600000; // Once per hour

        var node = this;

        if(this.dateinfilename === true)
        {
            this.retentionTimer = setInterval(function() {
                node.emit("check_retention", node);
            }, retentionTimerInterval);
        }
        

        this.on("check_retention", function(args) {
            var dtRetention = subtractDays(parseInt(args.retentiondays) + 1);
            var dtRetIso = dtRetention.toISOString().substring(0, 10).replace(/-/g, '_');
            var toDelete = path.resolve(args.dir, dtRetIso + "_" + args.filename);
            fs.access(toDelete, (err) => {
                if(err !== null) {
                    if(err.code == 'ENOENT')
                    {
                        // File does not exist, just skip
                    }
                    else {
                        console.log(err);
                    }
                }
                else {
                    // File exists, try to delete
                    fs.unlink(toDelete, (err) => {
                        if(err !== null) {
                            console.log(err);
                        }
                    });
                }
            });
        });
    }

    function subtractDays(numOfDays, date = new Date()) { date.setDate(date.getDate() - numOfDays); return date; }

    
    RED.nodes.registerType("Logging Configuration",BLBLogConfNode);

    BLBLogConfNode.prototype.close = function() {
        if (this.retentionTimer != null) {
            clearInterval(this.retentionTimer);
        }
    };

    function BLBFileLoggerNode(config) {
        RED.nodes.createNode(this, config);
        this.settings = config.settings;
        this.settingsConfig = RED.nodes.getNode(this.settings);
        var node = this;
        node.status({});

        node.logDir = this.settingsConfig.dir;
        node.filename = this.settingsConfig.filename;
        node.dateinfilename = this.settingsConfig.dateinfilename;
        node.includetimestamp = this.settingsConfig.includetimestamp;
        node.retentiondays = this.settingsConfig.retentiondays;

        if(this.settingsConfig)
        {
            node.on('input', function (msg) {
                if(msg.logging === undefined || msg.logging === null) {
                    msg.logging = {};
                    msg.logging.error = "Variable msg.logging was not defined.";
                    node.send([null, msg]);
                    return;
                }

                var stringToWrite = msg.logging.input;

                if(stringToWrite === undefined || stringToWrite === null) {
                    msg.logging.error = "Variable msg.logging.input was not defined.";
                    node.send([null, msg]);
                    return;
                }

                if(typeof stringToWrite !== 'string')
                {
                    msg.logging.error = "Variable msg.logging.input was not of type string.";
                    node.send([null, msg]);
                    return;
                }
                else {
                    var dt = new Date().toISOString();

                    // If an empty string is provided
                    if(stringToWrite == "")
                    {
                        // Write an empty string here
                        stringToWrite = "(empty msg.logging.input provided)";
                    }

                    // Check if we shall timestamp each entry
                    if(node.includetimestamp === true) {
                        stringToWrite = dt + ": " + stringToWrite;
                    }

                    stringToWrite += "\r\n";

                    // Check if we shall log to files with date prepended
                    var fp = "";
                    if(node.dateinfilename === true)
                    {
                        fp = path.resolve(node.logDir, dt.substring(0, 10).replace(/-/g, '_') + "_" + node.filename);
                    }
                    else {
                        fp = path.resolve(node.logDir, node.filename);
                    }

                    // Write to the log file
                    fs.appendFile(fp, stringToWrite, (err) => { 
                        if(err !== null) {
                            console.log(err);
                            msg.logging.error = err;
                            node.send([null, msg]);
                            return;
                        }
                    });

                    msg.logging.error = undefined;
    
                    node.send([msg, null]);
                }
            });
        }
        else {
            this.error("Not configured.");
        }

    }
    RED.nodes.registerType("log-to-file", BLBFileLoggerNode);
};

