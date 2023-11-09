# SSH Here

Create SSH sessions in current window.

### bug in original version:
If hostname has unicode/utf-8 and vs code default terminal changed to Git bash or cmd.exe, terminal.SetText will result in error or malformed characters because of bash/cmd.exe bugs.

### fix:
*Use powershell.exe if under win32, and chcp 65001 to support unicode hostname in display or ssh command.*

## Features

### Connect to SSH host listed in SSH config file.

*Run the `SSH Connect` command or use the default shortcut  `ctrl + alt + s` or `cmd + opt + s`.*

## Extension Settings

This extension contributes the following settings:

* `ssh-here.openSSHInEditor`: If true open the terminals in editor area.

## Known Issues

Nothing

## Release Notes

### 0.0.1

Initial release 

***
