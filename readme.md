[Examples](http://concord-consortium.github.io/lab-examples)
showing different ways of embedding and interacting with
[Lab Interactives](http://concord-consortium.github.io/lab/examples/interactives/interactives.html).

For more information see: http://lab.concord.org/ and https://github.com/concord-consortium/lab.

## Development

1. Clone this repo and install the Ruby Gem dependencies

    $ cd lab-examples
    $ bundle install --binstubs

2. In one shell start the Rack server

    $ bin/rackup config.ru

3. In a second shell start Guard

    $ bin/guard

4. Open http://localhost:9292/index.html

You can now make changes in the code and you browser will automatically be updated.