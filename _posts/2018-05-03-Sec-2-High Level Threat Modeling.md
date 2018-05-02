---
layout: post
title: Rational High-level Threat Modeling
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: This is the second post of the Rational Security series. In this post, we are taking a look at high-level threat modeling to capture stakeholders' concerns by looking at our operation holistically from a 30000 feet view.
---

Please make sure you check out the preceding post in the series: [An Introduction to Rational Security](https://felixhammerl.com/2018/05/03/Sec-1-Introduction-to-Rational-Security.html)

In order to figure out what needs to happen, we need to understand our stakeholders' concerns by looking at our operation holistically from a 30000 feet view. These concerns often come from ... 

- **regulatory obligations** imposed by government and standards bodies,
- **security obligations** towards *customers*, *society*, etc.,
- **policies** inside the organization, and
- **business goals**.

We will use those to examine what is important to us, **what** we need to protect, and understand the context of **why** security efforts must be undertaken. This will give us the ability to form **disaster scenarios** in terms our business stakeholders can understand, e.g. financial, legal, reputational, ethical. These disaster scenarios will serve as the basis for our threat model, which allows us to understand ahead of time where attacks are likely to come from, what the attack is likely to look like, and what can go wrong at which point. It allows us to prune entire classes or areas of attack. 

Consider the following estimation you might come across in boardrooms: `Vulnerability * Probability * Impact = Risk`. By far the most pervasive anti-patterns regarding threat modeling is using magic-quadrants, made-up severity ratings, applying some formulae, and serving it spiced up with *cyber*, *zero-day*, and *botnet*, all while ignoring the larger business context. Let me be absolutely clear: There is nothing *best* about these so-called best practices. This stems from a [calculus of neglicence](https://en.wikipedia.org/wiki/Calculus_of_negligence), as illustrated by the movie [Fight Club](http://www.imdb.com/title/tt0137523/):

> A new car built by my company leaves somewhere traveling at 60 mph. The rear differential locks up. The car crashes and burns with everyone trapped inside. Now, should we initiate a recall? Take the number of vehicles in the field, A, multiply by the probable rate of failure, B, multiply by the average out-of-court settlement, C. A times B times C equals X. If X is less than the cost of a recall, we don't do one.

Leaving this example's questionable ethics aside, let's investigate why this approach is not actually overly helpful and how it can be improved.

- The business context and wider impact are completely ignored: It is very hard to say how probable a thing is with no data to back it up, so we are resorting to guesses, which are often made out of context and without a sufficient understanding of the problem domain, i.e. they are unlikely to hold up under scrutiny. Please note that it is not entirely unreasonable to use estimations: Insurance companies (e.g. Munich RE) or payment card providers (e.g. Visa) are directly depend on whose business is based on estimating the probability of risks eventuating -- however, they have tons of data and statistical models to work with.
- The impact associated with an attack is hard to estimate and increasing: The impact is going to be determined by the shareholders, customers, government, regulatory bodies, etc. As we're moving towards tech at the core (Mandapaty, 2016), the threat profile of most organizations opens up to attack.
- Frequency of successful attacks is increasing: If your system is connected to the internet, don't fool yourself into thinking that is not constantly under attack. Case in point: Just assign a public IP address to an open SMTP relay and you will see abuse within minutes. 
- Effort and skill level required required to succeed in an attack are decreasing: There is a flurry of tools publicly available for use by penetration testers, attackers, and script kiddies alike for information gathering, vulnerability analysis, exploitation, sniffing, spoofing, etc.
- Probability is binary: If your system *can* be hacked and someone *has* the motivation to do so, it *will* be hacked. Without creating abuser personae, it's easy to go down a rabbit hole that's hard to recover from.

 So instead of guessing numbers, let's start using our knowledge of the business we're in and the systems we're building to provide context. Let's start by reminding ourselves **why** we want to threat model in the first place (Potter, 2014):

> Your job is to **facilitate** the business to operate in an as assured manner as possible, given the actual mission of the business [and] providing that context for people that aren’t security professionals as well as those that are: *Here’s how important this thing is in the grand scheme of things*.

Before we continue further, let's think about how we form a disaster scenario, which let's us reason about how bad the consequences are if your efforts fail. Any disaster scenario consists of three components: Asset, Security Goal, Actor. Please note that this line of reasoning is purposefully close to *means, motive, and opportunity*, representing the three aspects of a crime when prosecuted in a court of law.

#### Assets

An **asset** is something of value to an organization or attacker. It can be any physical or immaterial goods that you want to use in an activity but simultaneously need to be protected. Any system that needs protecting must have something that an attacker is interested in. In that sense, assets are essentially threat targets, i.e. they are the reason threats exist. In order to reason about our assets, let's ask ourselves: **Who am I, and what am I doing here?**

It helps if you draw from past conversations with senior stakeholders on the non-technical side or the Product Owner. Chances are these people have a good idea of what is valuable to them in the context of their organization. Upon answering this question, it is crucial to leave out all the FUD about what data might be valuable to attackers and instead only focus on your activities.

As a sidenote, it is important to understand that an attack rarely one-hop, but almost always consists of multiple hops, which form an *attack vector*. We'll dive deeper into attack vectors during application-level threat modeling.

#### Security Goals

The second part of a disaster scenario is **security goals**, of which one or more of the following three would be compromised.

**Confidentiality** is a component of privacy that implements to protect our data from disclosure to unauthorized parties.

**Integrity** of information refers to is the condition where information is kept accurate and consistent unless authorized changes are made, since information only has value if it is correct, protecting it from being modified by unauthorized parties. Typically, integrity refers to information being unchanged in transit, in storage, and in usage not intended to modify the information.

**Availability** is the key for any information system to serve its purpose, i.e. its information must be available, obtainable, and usable when needed. Compromising availability of information has become a very common attack nowadays. 

#### Threat Actors

A **threat actor** or in short **actor** is the person or organization attempting to undermine your security goals. Adversaries can be different, depending on the situation. In order to reason about threat actors, let's ask ourselves: **Who or what might try to mess with me, and how?**

To understand the characteristics of threat actors, let's build some actor personae, for which we'll assign a name, description, relationship, motive, intent, capability (Irwin, 2014).

**Relationship** determines whether the threat actor is *external* to, *internal* to, or a *partner* of the organization. Cyber criminals, state-sponsored threat actors, hacktivists, security researchers are typically external actors. Internal actors are employees, especially ones with elevated privileges like administrators or help desk employees. Partners are third party organizations that have business relationships with our organization, including competitors, suppliers, and end users.

Most external and internal threat actors have **motive** for their actions, unless the incident was accidental, in which case there *may* have been no motive. Common motives include financial gain, collateral gain, personal gain, general notoriety, political or ideological agenda. **Intent** is different from motive in the sense that it is the supposed action or purpose of the attack, e.g. purposely, knowingly, recklessly, negligently. 

In (Frye et al., 2012) the characteristics of a threat regarding **capability** are separated into *commitment* and *resource*. Reasoning on threat attributes is crucial when deciding on countermeasures or obstacles. Attributes of commitment are intensity, stealth, and time/perseverance, while the resource attributes are personnel, technical proficiency, and access. Both of the characteristics are highly correlated with funding.

Thinking along these terms also makes it clear why reasoning about nation-state adversaries is hardly useful when building a threat model, to which (Mickens, 2014) satyrically refers as the Mossad/not-Mossad duality:

> If your adversary is the Mossad, YOU’RE GONNA DIE AND THERE’S NOTHING THAT YOU CAN DO ABOUT IT

Seriously though, defending against an actor that has insight into each and every aspect of your environment that could serve as a trust anchor for you or your network, and has the resources to know about your network better than you do (Joyce, 2016) represents insurmountable adversity: 

> The theme I want you to take away is, if you really want to protect your network, you really have to know your network. You have to know the devices, the security technologies, and the things inside it. So why are we successful? We put the time in to know that network. We put the time in to know it better than the people who designed it and the people who are securing it. And that’s the bottom line.

Please be aware that not always does it require an attacker from the outside for something to go wrong. Sporadic failure (as the name implies) just happens at random without someone trying to actively run an attack on someone. Then there's people on the inside of your organization, which are continuously working on your network. And third, you have employees to which you have a trust relationship.

#### Disaster scenarios

An asset under threat by an actor, with at least one security goal being compromised is called a **disaster scenario**. Disaster scenarios can be painted by asking ourselves: **What could possibly go wrong?**

A **threat profile** will consist of multiple disaster scenarios that are applicable to the organization. Please note that a threat profile is not permanent, but has to be evolved alongside the technical architecture, product features, organization structure, etc.

As I've written these lines, I've imagined what people reading this would demand first: But how do I know what to start working on first? The short answer to this is *impact mapping*. Just take a moment to reflect on what is going to happen to your business in case this actually comes to pass. Are you going out of business? Will you have to spend a day restoring your database? Will you lose a critical competitive advantage? Or is it possible that your elaborate disaster scenario actually turns out to be a minor nuisance at best? Instead of spending a lot of effort on things that do not matter to you, you adopt Chris Hadfield's mantra of astronauts working through risks (Hadfield, 2013):

> What's the next thing that's going to kill me?

This is meant as a coping mechanism for the difference between fear and risk. When you start to go into every single detail of why that risk you've identified might affect what you're doing and what you can do to resolve it, have a plan, and be comfortable with it, only then can you remove irrational fear from the equation and start working through the actual risk. When you're done dealing with this one particular disaster scenario: Rinse and repeat.

Having developed a number of disaster scenarios allows you to develop heuristics to understand when a risk becomes imminent, which is the point where we're moving towards [application-level threat modeling in the next post of the Rational Security series](https://felixhammerl.com/2018/05/03/Sec-3-Application-Level-Threat-Modeling.html).

# References

Frye et al., [*Cyber threat metrics*](https://www.osti.gov/servlets/purl/1039394), 2012

Hadfield, [*An Astronaut's Guide to Life on Earth*](https://www.amazon.com/Astronauts-Guide-Life-Earth-Determination/dp/0316253014/), 2013

Irwin, [*Creating a Threat Profile for Your Organization*](https://www.sans.org/reading-room/whitepapers/threats/creating-threat-profile-organization-35492), 2014

Joyce, [*Disrupting Nation State Hackers*](https://www.usenix.org/node/194636), Talk at USENIX Enigma 2016

Mandapaty, McClure, [*Business Transformation in the Fourth Industrial Revolution*](https://info.thoughtworks.com/fourth-industrial-revolution-lp.html), 2016

Mickens, [*This World of Ours*](https://www.usenix.org/system/files/1401_08-12_mickens.pdf), 2014

Potter, [*t200 Threat Modeling for Realz*](https://www.youtube.com/watch?v=WKgD305OFAQ), Talk at Derbycon 2014 

