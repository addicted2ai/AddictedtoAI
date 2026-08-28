# content/blog/

Blog posts (`specs/blog`). One file per post, front matter declaring `date`.
Posts are dated and never silently rewritten: a correction is appended as a
dated block. More than 3 published posts dated within any trailing 7 days
produces a build warning (not a failure), and the loop refuses further `post`
jobs at that ceiling.
