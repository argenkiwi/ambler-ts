# Node Index

Columns: **name** | category | standalone | reads | writes | edges | utils
Regenerate with: `deno task index-nodes`

---

**clone-analyze** | clone | no | sourceRoot, walkName | filesToCopy, error | onSuccess (file list built), onError (walk file unreadable) | readFile, exists
> Scans a walk file to identify all node and util files that must be copied.

**clone-copy** | clone | no | sourceRoot, targetDir, filesToCopy | error | onSuccess (all files copied), onError (copy or mkdir failed) | copyFile, mkdir
> Copies all identified walk files from the source root to the target directory.

**clone-setup** | clone | no | sourceWalkPath, targetDir | sourceRoot, walkName, isNewProject, error | onNewProject (target lacks ambler.ts or deno.json), onExisting (target is a ready Ambler project), onError (args missing or source walk file not found) | exists
> Validates source walk path and target directory, detects whether the target needs Ambler initialisation.

**clone-stop** | clone | no | walkName, targetDir, filesToCopy, error | — | onDone (always) | print
> Reports clone result: lists copied files on success, prints error message on failure.

**count** | counter | yes | count | count | onCount (random() > 0.5, keep counting), onStop (random() <= 0.5, stop the walk) | print, sleep, random
> Increments a numeric counter by 1 and randomly transitions to continue or stop.

**start** | counter | yes | count | count | onSuccess (blank or valid numeric input), onError (non-numeric input) | readLine, print
> Prompts the user for a starting number and parses it into an integer.

**stop** | counter | yes | count | — | onDone (always) | print
> Prints the final count value and transitions to the terminal edge.

**init-config** | init | no | targetDir | error | onSuccess (deno.json written successfully), onError (write failed) | writeTextFile
> Writes a default deno.json configuration file to the target directory.

**init-copy** | init | no | targetDir | error | onSuccess (ambler.ts copied successfully), onError (copy failed) | copyFile, getAmblerSrc
> Copies the ambler.ts engine file into the target project directory.

**init-setup** | init | no | targetDir | error | onSuccess (directory structure created), onError (targetDir missing, not a directory, or mkdir failed) | mkdir, stat
> Creates the standard Ambler folder structure at the target directory.

**init-stop** | init | no | targetDir, error | — | onDone (always) | print, exit
> Reports init result and exits with code 1 on failure.
