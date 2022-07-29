![Platform Node-RED](http://b.repl.ca/v1/Platform-Node--RED-red.png)
[![npm version](https://badge.fury.io/js/@blacklabelbytes%2Fnode-red-file-logger.svg)](https://badge.fury.io/js/@blacklabelbytes%2Fnode-red-file-logger)
![npm download](https://img.shields.io/npm/dw/@blacklabelbytes/node-red-file-logger)

# node-red-file-logger
File logger node for Node-RED

# Description
This node for Node-RED can be used to persist text strings to log files on your file system. The reason for creating the node was to save information on the requests sent by users to a Node-RED installation, how the processing of it proceeded, and what the end result was.

# Installation

As of writing, this node is not tagged with "node-red" as keyword, so it does not show up in Node-RED palette yet. Therefore, to install it, you need to access the console of your installation and run

`npm install @blacklabelbytes/node-red-file-logger`

Then restart your Node-RED installation and the node should show up in the "common" section.

# Configuration
Define one or more logging configurations (via config nodes) that define where and how log files will be managed. The following settings are used for the configuration:

- **Name**: A name by which you recognize the log storage. This becomes part of the node name, e.g. if the name of the configuration is "Documents", the file logging node will read "Log to Documents".
- **Directory**: The directory on your file system where the log file(s) for this configuration will be stored. E.g. "/var/log/nodered" or "C:/NodeRed".
- **Filename**: The name of the log file that will be used, e.g. "log.txt".
- **Prepend with current date**: Use this to have the node create separate files for each day. For example, if "Filename" is set to "log.txt", the logger would create files named "2022_07_22_log.txt".
- **# of days retention**: Conditional if using the above "prepend with current date". The node will try to keep the number of log files to this number of files (to avoid running out of disk space). E.g. if set to 5, you will have the most recent 5-6 days of logs retained.
- **Timestamp each entry**: Use this to have the node timestamp each entry with ISO8601 timestamp.

# Usage
Create at least one configuration and use it in the node. If different events in your system should be logged to different folders or with different log file names, create separate configuration nodes and choose the desired one in each flow.

Input a string via the `msg.logging.input` variable. The string will be appended to the log file.

# Examples 

Simple example of how to log to a file (in the example on a Windows machine). A function node composes a message to log to the file.

![Flow Example 1](images/Example1.png)

A slightly more advanced example is where an HTTP request comes in. The input data is logged first, then some processing of the request is done. Depending on the success of the processing, either a success response or an error response is provided. The data logged to the file depends on each case.

![Flow Example 2](images/Example2.png)

# Output ports
The 1st output of the file logger outputs a message if the message was successfully written to the log file. The 2nd output of the file logger outputs a message if an error occurred while logging.

You can use the 2nd output to monitor for errors, e.g. file permissions, disk space etc. An error message is provided in the `msg.logging.error` variable.

# License
MIT
