' Runs the scheduled Pulse with NO visible window.
'
' Why a VBScript rather than a flag on the task: Task Scheduler's own "Hidden"
' setting only hides the task from the default list view, and a .cmd action
' launched under an interactive logon still flashes a console. PowerShell's
' -WindowStyle Hidden flashes too, briefly, because the host starts before it
' applies the style. WScript.Shell.Run with intWindowStyle 0 never creates one.
'
' The alternative — running whether the user is logged on or not (S4U) — would
' also be windowless, but it is the wrong trade here: the Pulse pushes, and
' `git push` authenticates through Windows Credential Manager, which is bound to
' the interactive user profile. A windowless run that cannot push would be worse
' than a visible one that can.
'
' 0 = hidden, True = wait for it to finish so the task's Last Run Result is the
' Pulse's real exit code rather than the launcher's.

Dim shell, here, cmd
Set shell = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
cmd = """" & here & "\run-pulse-scheduled.cmd" & """"
WScript.Quit shell.Run(cmd, 0, True)
