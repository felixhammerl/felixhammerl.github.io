---
layout: post
title: Why Alice Has a Problem if Bob Can’t Encrypt
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: I listened to many good talks at the 31st Chaos Communication Congress in Hamburg (GER) last December. I was especially impressed by
---
      
I listened to many good talks at the 31st Chaos Communication Congress in Hamburg (GER) last December. I was especially impressed by ["Crypto Tales from the Trenches"](https://media.ccc.de/browse/congress/2014/31c3_-_6154_-_en_-_saal_1_-_201412272300_-_crypto_tales_from_the_trenches_-_nadia_heninger_-_julia_angwin_-_laura_poitras_-_jack_gillum.html#video) by Nadia Heninger, Julia Angwin, Laura Poitras, and Jack Gillum, and ["Reconstructing narratives"](https://media.ccc.de/browse/congress/2014/31c3_-_6258_-_en_-_saal_1_-_201412282030_-_reconstructing_narratives_-_jacob_-_laura_poitras.html#video) by Jacob Appelbaum and Laura Poitras. That got me thinking about the state of crypto in 2015 and the hard parts of developing a cryptosystem for the real world.

This post sets out to explain the merits of cryptography ("The Good") and how to apply the lessons learned ("The Bad").

# The Good

More open-source initatives are working towards an encrypted future than ever before. This is a good thing! This shows a stronger level of interest and activity anyone would have expected prior to June 2013.

A crypto-anarchist's dream is an ideal world where everybody would communicate in encrypted form. Computers of all shapes and sizes would communicate in a way that prevents eavesdropping and allows for tamperproof message exchange, in theory giving birth to a new kind of freedom unlike anything we haveseen before. The change is happening now, at that very moment, all around the globe, right under your nose! Jon Callas' talk ["The Revolution Will Be Encrypted"](https://www.youtube.com/watch?v=VLTGyYU52VQ) sums this up very welly. If you apply cryptography to modern communication tools, the result can be marvellous:

* Cryptography erases distance. You can whisper in someone's ear who is a world away, choose to associate with whom you want to associate. And nobody in between is the wiser.
* You can speak publicly. Everybody can make sure that the message relayed to them is unmodified.
* You can speak privately. You can choose to not be on the record. You can create a space where you can be stupid, or be wrong, or assume a different identity, or develop new ideas.

Those three basic human rights, enabled by applied mathematics, offer enormous potential for a free and open society.

Investigative journalism is a good example here. Besides the legislative, executive and judicial branches of the government, journalism is an extra-governmental forcing function in the system of checks and balances. Investigative journalists have the power to rectify deficiencies. Their unique ability is to get insights in otherwise completely walled-off affairs. In order to do this, the ability to speak privately to your source is a life insurance. All too often in a very literal sense.

> But I have nothing to hide?!

So, what if you really had nothing to hide? Really? Suffice to say that there are numerous studies out there to show how much of a misconception it is to assume that no harm will come to you because you are not interesting. Surveillance is a form of behavioral control. Because you will change your behavior if you know that you are under surveillance. Those two sources sum this up quite nicely:

* ["'I've got nothing to hide' and other misunderstandings of privacy" by Daniel Solove](http://tehlug.org/files/solove.pdf)
* ["Why privacy matters" by Glenn Greenwald](http://www.ted.com/talks/glenn_greenwald_why_privacy_matters)

# The Bad

Mass surveillance of electronic communication is a fact. We have had our suspicions for a long time, now we know for sure. Equally worrying are the reports about active corruption of cryptographic standards in order to promote weak or backdoored implementations. Only a small number of well-designed crypto protocols and their implementations in Open Source Software hold up under scrutiny. Among them is the **PGP** standard for email encryption.

So while tools for effective protection from mass surveillance exist, they are mostly very hard to use due to bad user experience (UX). Let's look at how an encrypted conversation between Alice and Bob might start:

1) Alice has to invest time to seek out the appropriate tools.
2) Alice has to invest time and money to learn to use those new tools.
3) Alice has to invest time to convince her communication counterpart Bob to use those tools.
4) Bob has to invest time and money to learn to use those tools, too.

And they also have to invest time to deal with the overhead of encrypted communication, e.g. being restricted to certain devices.

Let's have a more detailed look at step 2 in the following section "Make your stuff usable for Alice" and step 4 in the section "Make your stuff usable for Bob".

## Make your stuff usable for Alice

Your level of protection can only be as good as the weakest link in the chain. The design of cryptosystems in itself is hard enough, especially when they are attacked by an infinitely powerful adversary. But all too often, the [weakest](http://www.cs.berkeley.edu/~tygar/papers/Why_Johnny_Cant_Encrypt/USENIX.pdf) [link](http://www.chariotsfire.com/pub/sheng-poster_abstract.pdf) [is the](http://www.academia.edu/3042410/Crying_Wolf_An_Empirical_Study_of_SSL_Warning_Effectiveness) [user](http://www.cl.cam.ac.uk/users/rja14/Papers/wcf.pdf), even if the crypto is solid.

In that case, the next best option is lowering the entry barrier. This is typically achieved by well-designed UI and UX. But how do you achieve a pleasant UX for crypto? The answer is painfully obvious: *Hide the crypto*.

During the past year of working on [Whiteout Mail](https://mail.whiteout.io/), I have come to understand that users don't want to be bothered with encryption. Cryptographic tools are typically designed by engineers. An engineer has a pretty good impression of what the program is supposed to do. They know what's happening behind the scenes. They want to be in control. They know about fingerprints and key lengths. They know the difference between a public key and a private key. They want to choose whether to send in PGP/MIME or PGP/INLINE, to encrypt and/or sign a message. They already know what to do. Now guess what would happen if someone took all that knowledge away and told them to use the very same tool again.

![I have no idea what I'm doing](http://i1.kym-cdn.com/photos/images/facebook/000/234/739/fa5.jpg)

All of a sudden, all the options are overwhelming. There's no way of knowing what it could possibly mean. If a user is unsure about what you want from them, two things will happen:

* They will assume that they will probably do something wrong.
* Out of fear of doing something wrong they will stop using your stuff altogether.

If you look more closely, all of the complexity could have been substituted by safe defaults. [In his SOUPS '14 keynote](https://www.youtube.com/watch?v=is9luGFzqgA) Christopher Soghoian explains why safe defaults are a really good idea when it comes to complexity. Why not use PGP/MIME by default? Why not generate 2k or 4k RSA keys by default? Why not hide signatures if they are valid and only show them if they are invalid? Or why not change use a nomenclature that explains what signatures actually represent, i.e. the message integrity? Most of those things reflect details of the underlying protocol. And the average user mostly does not care about that (and rightfully so).

Show the details if something goes wrong? *Absolutely*. Show that something goes wrong and give the user the ability to dig deeper with optional error information.

Hide the details as long as everything is ok? *Absolutely*. Leave the options to the pros, they'll know what to look for in the preferences.

So now you've finally managed to create a usable cryptosystem, at least for the Alice you had in mind when you developed it. 

Now comes the hard part: Alice wants to put it to good use and communicate with Bob.

## Make your stuff usable for Bob

This one is basically about empathy. While your users, i.e. Alice, have at least an idea that they want to use crypto, their communication partners, i.e. Bob, on the other hand are considerably harder to get on board. More likely than not Bob will not even know that he is using cryptography. Bob will be far less motivated to figure out the parts where you failed to guide him. Bob will not know what to do. Please listen to [what Poitras, Angwin et al. say about what happens when you make the Bobs of this world use crypto](https://media.ccc.de/browse/congress/2014/31c3_-_6154_-_en_-_saal_1_-_201412272300_-_crypto_tales_from_the_trenches_-_nadia_heninger_-_julia_angwin_-_laura_poitras_-_jack_gillum.html#video).

When you lose Bob during the onboarding process, privacy gives way to convenience. Bob thinks he might as well send in plain text, because who would be interested in him anyway? What's the worst thing that might happen? Bob has no way of knowing that as soon as somebody pulls his communication logs, he is naked and his life is ripped wide open. Would you want the contents of your email account be open to everyone? Just ask [Colin Powell](http://www.dailymail.co.uk/news/article-2382681/Colin-Powell-admits-sending-personal-emails-Romanian-diplomat-DENIES-having-affair-hacker-threatens-leak-intimate-messages.html), [Anthony Weiner](http://edition.cnn.com/2011/POLITICS/06/16/weiner.scandal/), or [David Petraeus](http://edition.cnn.com/2012/11/12/us/petraeus-cia-resignation/).

**When you develop a cryptosystem, please have some empathy for Bob, i.e. the people on the other end of the line. Bob is the one that makes or breaks your cryptosystem!**
