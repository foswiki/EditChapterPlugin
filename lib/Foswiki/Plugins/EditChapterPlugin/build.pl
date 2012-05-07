#!/usr/bin/perl -w
BEGIN {
    unshift @INC, split( /:/, $ENV{FOSWIKI_LIBS} );
}
use Foswiki::Contrib::Build;

# Create the build object
my $build = new Foswiki::Contrib::Build('EditChapterPlugin');

# Build the target on the command line, or the default target
$build->build($build->{target});

