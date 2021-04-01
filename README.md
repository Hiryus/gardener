# Gardener

Gardener is a small utility with the aim to update ndoejs dependencies regularly and without human interraction.
This allows a program to always be up to date with latest security patches and lower the upgrades cost.


## How it works

Gardener is based on the following workflow:
1. Update `package.json` dependencies version based on a set of rules.
2. Install the new dependencies and update `package-lock.json` accordingly.
3. Run tests to ensure the application behavior is not changed.
4. Commit and push the changes (which may trigger a deployment).

If any of the step fails, subsequent ones are cancelled.

Gardener cannot test your application, but it can manage the other tasks for you.


## Install

Simply:
```
npm install --save-dev @hiryus-org/gardener
```

NB: gardener requires node version 12 or greater.



## Configuration

Usually, gardener is called from a regular CI / CD pipeline with the following sequential steps / jobs / stages:
1. Update dependencies with `npx gardener update`.
2. Run tests (we recommend to test different environments including LTS and latest nodejs versions).
3. Commit changes `npx gardener commit`.

For each test, make sure to clone the repository on the branch you want to update (usually `master`).

If files are wiped between the different pipeline steps (if each step uses its own containers for example), it is your responsability to copy the  `package.json` and `package-lock.json` files from one step to the others. Most piepline provide an "artifact" feature with this aim.

### The "update" command 

Gardener "update" command expects npm to be installed (and credentials configured if you are using private packages).

It supports the following arguments (they can be specified several times):
 - `--ignore-version=<pattern>` - regular expression describing versions to ignore (for any package).
 - `--ignore-package=<pattern>` - regular expression describing packages to ignore.

NB: all patterns are created with the "ignore case" switch.

### The "commit" command 

Gardener "commit" command expects git to be installed and allowed to push modification for the current branch.

It supports the following arguments:
 - `--username=<string>` (default: `gardener-bot`) - git comitter name to use for the commit.
 - `--email=<string>` (default: empty) - git comitter email to use for the commit.
 - `--message=<string>` (default: `chore(deps): dependencies update [skip ci]` ) - comit message to use.

NB: Gardener will always commit the `package.json` and `package-lock.json` files if one of them has changed.
Make sure the tests (or other part of the pipeline) don't change them !

### Schedule

We recommend to run the update pipeline every night so that:
* Each run only pulls a few updates at a time (it makes it a lot easier to find which update introduced a breaking change),
* The application stays relatively up to date with latest versions.
* New commits don't disturb your day work.

### Example with gitlab CI

```yaml
image: node:latest

before_script:
- npm ci

stages:
- update
- test
- commit

update:
  stage: update
  script:
  - npx gardener update
  artifacts:
    expire_in: 1 day
    paths:
    - package.json
    - package-lock.json

lint:
  stage: test
  script:
  - npm run lint

test:
  stage: test
  script:
  - npm run test

commit:
  stage: commit
  script:
  - npx gardener commit
```


## Limitations

- Under the hood, gardener use the `npm outdated` command to find each package latest version. This command only returns the last version, and not the versions in-between.
  Thus, if the latest version is ignored, gardener cannot check if there is an intermediate version available (a version between the current and the latest ones).
  This is why we recommend to update regularly so that each versions is applied before the next one is published.


## Trivia

To avoid using any dependency, gardener uses a very simple argument parser with doesn't knows about arguments order.
This mean that `gardener --include-release-candidate update` is actually valid and the same as `gardener update --include-release-candidate`.
We recommand to stick to the "standard" way of using the command first, and then extra arguments.
