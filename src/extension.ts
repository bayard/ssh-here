import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as sshConfig from 'ssh-config';

function findSSHConfigPaths(): string[] {
    const homeDir = os.homedir();
    const sshConfigPaths = [
        path.join(homeDir, '.ssh', 'config'),
        path.join(homeDir, '.ssh', 'config.d', '*.conf') // Include additional patterns if needed
    ];

    return sshConfigPaths;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ssh-here.connect', async () => {
        const sshConfigPaths = findSSHConfigPaths();
        const remoteNames: string[] = [];

        sshConfigPaths.forEach(sshConfigPath => {
            try {
                const sshConfigContent = fs.readFileSync(sshConfigPath, 'utf-8');
                let currentRemoteNames: string[] = [];
                sshConfig.parse(sshConfigContent).forEach(
                    line => {
                        if ('param' in line && 'value' in line) {
                            if (line.param == 'Host') {
                                if (typeof line.value === 'string') { 
                                    currentRemoteNames.push(line.value);
                                }
                                
                            }
                        }
                    }
                ); 
                remoteNames.push(...currentRemoteNames);
            } catch (error) {
                console.error(`Error reading ${sshConfigPath}: ${error}`);
            }
        });

        const configureSshOption = `$(plus) Configure SSH Hosts...`;
        remoteNames.push(configureSshOption);

        const selectedRemote = await vscode.window.showQuickPick(remoteNames, {
            placeHolder: 'Select an SSH remote'
        });

        if (selectedRemote === configureSshOption) {
            // Show another QuickPick to select an SSH config file
            const selectedConfigPath = await vscode.window.showQuickPick(sshConfigPaths, {
                placeHolder: 'Select an SSH config file'
            });

            if (selectedConfigPath) {
                vscode.workspace.openTextDocument(selectedConfigPath).then(document => {
                    vscode.window.showTextDocument(document);
                });
            }
        } else if (selectedRemote) {
            const config = vscode.workspace.getConfiguration('ssh-here');
            const openSSHInEditor = config.get<boolean>('openSSHInEditor', false);
            const terminalName = `${selectedRemote}`;

            var isWin = process.platform === "win32";
            var targetShell = process.env.COMSPEC;
            if(isWin)
            {
                targetShell = "powershell.exe";
            }

            const terminal = vscode.window.createTerminal({
                name: terminalName,
                //shellPath: process.env.COMSPEC,
                shellPath: targetShell,
                shellArgs: [],
                location: openSSHInEditor ?
                    vscode.TerminalLocation.Editor : vscode.TerminalLocation.Panel,
                isTransient: true,
            });
            //terminal.sendText(`ssh ${selectedRemote}`);
            if(isWin)
                terminal.sendText('chcp 65001', true);
            let sshhost = selectedRemote;
            terminal.sendText('ssh ', false);
            terminal.sendText(sshhost, true);
            terminal.show();
        }

        
    });

    context.subscriptions.push(disposable);
}
