# content/tutorials/

Dynamic education — tutorials that perish (`specs/education-dynamic`). One
file per tutorial, front matter declaring `subjects`, `verified_against`,
`verified_on` and `reverify_days`. Every tutorial's steps must have been
actually executed; the build injects the verification stamp, the staleness
banner, and the demotion treatment at 2x the re-verification interval.
