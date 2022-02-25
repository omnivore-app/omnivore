Guidelines
==========

When contributing to Omnivore, please follow the style of the file you
are editing. For most code running `yarn lint` should tell you if
your code meets are style.


License
=======

Omnivore is licensed under the AGPL license.

CLA
=======

Contributions are taken under [Omnivore's CLA](https://cla-assistant.io/omnivore-app/omnivore).

Code Review
=======
We require code review from a [CODEOWNER](https://github.com/omnivore-app/omnivore/blob/main/.github/CODEOWNERS) before merging a pull request.

Testing
=======

Pull requests are automatically tested using GitHub Actions. Wed
usually only merge a pull request if it causes no regressions in a
test run.

When you submit a pull request, one of two things happens:

* If you are a new contributor, GitHub will ask for permissions (on
  the pull request) to test it. A maintainer will reply to approve
  the test run if they find the patch appropriate.
* If you have previously contributed, GitHub will test your pull 
  request as soon as a test machine is available.

Once tests are passing on your pull request it will be reviewed, 
merged, and deployed by a maintiner. We deploy around ten times
a day, so your changes should hit production quickly.
