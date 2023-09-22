"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mibase_1 = require("./mibase");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const mi2_1 = require("./backend/mi2/mi2");
class GDBDebugSession extends mibase_1.MI2DebugSession {
    initializeRequest(response, args) {
        response.body.supportsGotoTargetsRequest = true;
        response.body.supportsHitConditionalBreakpoints = true;
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsConditionalBreakpoints = true;
        response.body.supportsFunctionBreakpoints = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsSetVariable = true;
        response.body.supportsStepBack = true;
        this.sendResponse(response);
    }
    launchRequest(response, args) {
        this.miDebugger = new mi2_1.MI2(args.gdbpath || "gdb", ["-q", "--interpreter=mi2"], args.debugger_args, args.env);
        this.setPathSubstitutions(args.pathSubstitutions);
        this.initDebugger();
        this.quit = false;
        this.attached = false;
        this.initialRunCommand = mibase_1.RunCommand.RUN;
        /* this.isSSH = false; */
        this.started = false;
        this.crashed = false;
        this.setValuesFormattingMode(args.valuesFormatting);
        this.miDebugger.printCalls = !!args.printCalls;
        this.miDebugger.debugOutput = !!args.showDevDebugOutput;
        this.stopAtEntry = args.stopAtEntry;
        /* if (args.ssh !== undefined) {
            if (args.ssh.forwardX11 === undefined)
                args.ssh.forwardX11 = true;
            if (args.ssh.port === undefined)
                args.ssh.port = 22;
            if (args.ssh.x11port === undefined)
                args.ssh.x11port = 6000;
            if (args.ssh.x11host === undefined)
                args.ssh.x11host = "localhost";
            if (args.ssh.remotex11screen === undefined)
                args.ssh.remotex11screen = 0;
            this.isSSH = true;
            this.setSourceFileMap(args.ssh.sourceFileMap, args.ssh.cwd, args.cwd);
            this.miDebugger.ssh(args.ssh, args.ssh.cwd, args.executable, args.arguments, args.terminal, false, args.autorun || []).then(() => {
                this.sendResponse(response);
            }, err => {
                this.sendErrorResponse(response, 105, `Failed to SSH: ${err.toString()}`);
            });
        } else */
        {
            this.miDebugger.connectToQnx(args.cwd, args.executable, args.targetFIlePath, args.remotePort, args.autorun || []).then(() => {
                this.sendResponse(response);
            }, err => {
                this.sendErrorResponse(response, 102, `Failed to connect to MI debugger: ${err.toString()}`);
            });
        }
    }
    attachRequest(response, args) {
        this.miDebugger = new mi2_1.MI2(args.gdbpath || "gdb", ["-q", "--interpreter=mi2"], args.debugger_args, args.env);
        this.setPathSubstitutions(args.pathSubstitutions);
        this.initDebugger();
        this.quit = false;
        /* this.attached = !args.remote; */
        this.attached = true;
        this.initialRunCommand = args.stopAtConnect ? mibase_1.RunCommand.NONE : mibase_1.RunCommand.CONTINUE;
        /* this.isSSH = false; */
        this.setValuesFormattingMode(args.valuesFormatting);
        this.miDebugger.printCalls = !!args.printCalls;
        this.miDebugger.debugOutput = !!args.showDevDebugOutput;
        this.stopAtEntry = args.stopAtEntry;
        /* if (args.ssh !== undefined) {
            if (args.ssh.forwardX11 === undefined)
                args.ssh.forwardX11 = true;
            if (args.ssh.port === undefined)
                args.ssh.port = 22;
            if (args.ssh.x11port === undefined)
                args.ssh.x11port = 6000;
            if (args.ssh.x11host === undefined)
                args.ssh.x11host = "localhost";
            if (args.ssh.remotex11screen === undefined)
                args.ssh.remotex11screen = 0;
            this.isSSH = true;
            this.setSourceFileMap(args.ssh.sourceFileMap, args.ssh.cwd, args.cwd);
            this.miDebugger.ssh(args.ssh, args.ssh.cwd, args.target, "", undefined, true, args.autorun || []).then(() => {
                this.sendResponse(response);
            }, err => {
                this.sendErrorResponse(response, 104, `Failed to SSH: ${err.toString()}`);
            });
        } else */
        {
            /* if (args.remote) {
                this.miDebugger.connect(args.cwd, args.executable, args.target, args.autorun || []).then(() => {
                    this.sendResponse(response);
                }, err => {
                    this.sendErrorResponse(response, 102, `Failed to attach: ${err.toString()}`);
                });
            } else  */ {
                this.miDebugger.attach(args.cwd, args.executable, args.target, args.remotePort, args.autorun || []).then(() => {
                    this.sendResponse(response);
                }, err => {
                    this.sendErrorResponse(response, 101, `Failed to attach: ${err.toString()}`);
                });
            }
        }
    }
    // Add extra commands for source file path substitution in GDB-specific syntax
    setPathSubstitutions(substitutions) {
        if (substitutions) {
            Object.keys(substitutions).forEach(source => {
                this.miDebugger.extraCommands.push("gdb-set substitute-path \"" + (0, mi2_1.escape)(source) + "\" \"" + (0, mi2_1.escape)(substitutions[source]) + "\"");
            });
        }
    }
}
vscode_debugadapter_1.DebugSession.run(GDBDebugSession);
//# sourceMappingURL=gdb.js.map