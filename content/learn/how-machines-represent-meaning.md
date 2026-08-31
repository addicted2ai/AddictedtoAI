---
title: How machines represent meaning
level: foundations
outcome: >-
  You can say what an embedding is, why nearby points mean similar things, and
  name the single trick under search, recommendation and image prompts alike.
prerequisites:
  - what-a-neural-network-is
mentions:
  - concept/embeddings
---

Search a pile of your own notes for *cheap places to eat* and up comes a line
about *budget restaurants*. The two phrases share no word. Nothing was tagged,
nobody wrote a synonym list, and yet something had decided those phrases
belong together before you typed anything at all.

## What a layer actually hands forward

The deciding was done in the only currency a network has. [Redescribing the
input](/learn/what-a-neural-network-is) is what the layers do, one after
another, each description a step closer to the question being asked. That is
easy to read as a manner of speaking. It is not one. Inside the network a
description is a physical object: a list of numbers, a few hundred of them or
a few thousand, one from each neuron in that layer as your input passes
through. That list is the only thing a network ever passes forward.

Normally it is a waypoint on the road to a verdict, thrown away the instant
the verdict arrives. So do the obvious thing. Run the network, stop it
partway, keep the list, discard the rest. You now hold the machine's own
description of a thing, in the form it uses internally, and you can put that
to work on jobs the network was never trained to do. The kept list is called
an embedding, and a network built for no other purpose is an embedder, [one of
the families of model](/learn/the-kinds-of-models) — no verdict, no picture,
no sentence, only a position.

Position, because a list of numbers is one. Two numbers locate a place on a
map the way a latitude and a longitude do, and three locate a place in a room.
A longer list breaks nothing except your ability to picture it, and picturing
was never the useful part. What matters survives the extra numbers: two
positions are near or far, and how near can be measured. Everything else here
is that one fact being spent.

## Placed by the company they keep

Nobody assigns the positions. No step in training asks for a tidy map, just as
[nothing asked the early layers to find
edges](/learn/what-a-neural-network-is). The map is what the arithmetic drifts
into, because drifting there makes the work cheaper.

Watch what training is up against. A network reading text has to do something
with cheap, inexpensive, affordable and budget. Each shows up in the same kind
of sentence, doing the same job. A description that scatters those four widely
forces the network to learn its next move four separate times. A description
that stacks them close lets one lesson serve all four. Stacking them lowers
the wrongness score, so [computed blame](/learn/what-a-neural-network-is)
presses them together, a fraction at a time, for as long as training runs.
Words used alike end up placed alike, and that is the whole of the rule.

Follow it through and notice what never happens. Nothing consults a
dictionary. Nothing is told that cheap and affordable are synonyms, and no
part of the process would know what to do with the information if you supplied
it. **Nothing here was ever taught what a word means, because meaning was
traded for position, and position is something arithmetic can measure.**

## Nearest wins

Once things have positions the answerable question changes. Not *does this
document contain the words I typed*, which fails the moment you and the writer
picked different words. Instead: *of everything on the map, what sits closest
to this?* The store that holds millions of such positions is a vector
database, vector being the field's word for the list of numbers, and it is
duller than its name. It keeps the positions and a note of where each came
from. It holds no meaning and answers no questions; its one skill is handing
back the entries nearest a position you give it.

Four different-looking jobs are that one query with different things on the
map. Semantic search puts your phrase on a map of documents and returns the
neighbours, which is the notes example at scale. Recommendation puts people
and items on a map instead of words: what placed cheap beside affordable was
turning up in the same sentences, and what places two films beside each other
is turning up in the same people's viewing. The map does not care what sort of
company it is keeping. Clustering asks no question at all, but puts a few
million things on the map and looks at where they bunch, and the bunches are
categories nobody wrote down, which is how a support team learns that its
thousands of complaints are four complaints.

The fourth should strike you as strange. Nothing says a map may hold only one
kind of thing. Train on photographs paired with their captions, pushing each
caption toward the photograph it describes, and pictures and sentences come to
share a single map. A typed phrase then has a position among photographs. That
is the bridge under most image generators that take words: your prompt becomes
a place, and the generator is steered toward pictures that belong there. Some
are wired differently, reading the prompt with an encoder trained on nothing
but text, which never shared a map with a photograph at all. What survives
every version is the steering rather than the shared map: the words become a
position, and a position is something the generator can be pulled towards.

## Where near is not alike

The map is built out of company kept, and company is not likeness. Hot and
cold appear in the same sentences, before the same nouns, doing the same job.
So do always and never. So do a claim and its flat denial, which differ by one
small word that changes everything about the meaning and nothing much about
the company. Distance puts them close, and a search ranked by distance will
hand you the reverse of what you asked for with no sense of having erred.
A bigger map does not fix this. Near means *these go in the same slot*, and
opposites are the pair of things that most reliably go in the same slot.

Then the folklore, which you may already have met: take the position of king,
move away from man, move toward woman, and the nearest point is queen.
Something regular really is there. The same journey that separates man from
woman separates king from queen and actor from actress, close enough that
people noticed and every popular account has repeated it since. What those
accounts leave out is that the standard implementations producing the famous
answer are forbidden to return any of the words you put in. Lift that rule and
the nearest point to the query is very often just one of them, because a short
step away from king mostly lands you back beside king. [The wiki
entry](/wiki/concept/embeddings) has the measurements and the paper that found
it.

The exclusion lived in a helper function rather than in the geometry, and
nobody was hiding it. But it means the famous demonstration of what the map
holds was also, quietly, a demonstration of what a lookup was permitted to
say, and that generalises well past the party trick. You never see a map. You
see what a query handed back after applying its own rules about how many
results and how far is too far, and those rules are written where nobody
thinks to look.

## The signature it leaves

You can now recognise this machinery from outside, because it leaves a
signature: uncanny at roughly, unreliable at exactly. The system that finds
the note you half remember from a phrase you misremembered, and then serves
you with total confidence the one document saying the reverse of what you
needed, is not being clever and then stupid. It did the identical thing both
times. Something was near your question, and nearness is the only thing it was
ever asked about.
