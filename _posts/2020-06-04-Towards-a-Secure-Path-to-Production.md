---
layout: post
title: Towards a Secure Path to Production
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: In this post, we explore what it takes to create a secure software delivery lifecycle. The reader learns how risk and security are related, which development practices need to be taken into account, what it takes to support a secure application in production.
---

*Also appeared on [ThoughtWorks Insights](https://www.thoughtworks.com/insights/articles/towards-a-secure-path-to-production)*

asdasddAsk anyone in tech and they’ll tell: security is a paramount concern. And yet, while organizations draw up endless lists of security requirements, most find applications and frameworks are still riddled with vulnerabilities; they use frameworks that are no longer maintained; or components aren’t updated. And feature pressure almost always trumps the laborious process of security. But it needn’t be that way. Here, I’ll explore how to convince your enterprise to build security into software engineering and make security the first-class citizen it deserves to be.


# News comes first, then comes the shock

Today, few companies are prepared for the impact of a security breach — indeed often, the first a companies know about it is when they see it in the news.. Indeed, in 2016, the mean time to discovery was [99 days (2016)](https://it-securityworld.com/assets/whitepapers/2017Jan_Apr1618.pdf). On the positive side, that figure has been falling (in 2012, the mean time to discovery was [416 days](https://www.scribd.com/document/370662392/Mtrends2016-pdf)); but given we’re looking at averages here, it means in many cases, breaches aren’t discovered for years.

Against this background, the number of attacks is rising, while the technical skills an attacker needs is declining. What’s more important is that our attack surface is growing, as every machine (including light bulbs, baby monitors, and dish washers) that is reachable from the internet is under constantly being probed. And as we know only too well, once attackers have found a hole, the effects can be devastating, often resulting in regulatory fines, stock prices dipping, or lay-offs. That being said, we have yet to observe a major tech company being pushed into bankruptcy by a cyber attack.

Once a security hole is discovered, digital forensics called in, environments walled off, audits done, investigators often discover that staff knew in advance that systems were vulnerable. That’s because team members know what needs fixing, but their warnings go unheeded. What’s needed is a model for shared responsibility for security.

Three movements that radically transformed the tech landscape over the last decade were Design Thinking (Objective: Fitness for use), Lean Startup (Objective: Product-market-fit), and DevOps (Objective: Responsiveness). The common theme here is to include their respective objectives **earlier in the development process** rather than tacking it on as an afterthought after development is done. Now it is easy to see why it is orders of magnitude harder to effectively retrofit security instead of baking it into the development process. In marketing-freight words, this is often referred to as “Shift Security Left" or “SecDevOps".


# Everybody wants to be safe and secure – but from what?

How can we — given the variety of risks we face — identify where to focus our security efforts? Many organizations use risk estimation models, which employ a version of the “calculus of negligence", to quantify exposure by looking at impact and severity of abuse. There is nothing inherently wrong with these models. As an example, OpenFAIR's model of quantifying inherent risk works along those lines.

And while these models aren’t directly actionable and produce little guidance as to where and how to implement controls and mitigate risk, they can enable you to understand your exposure, which can inform your software delivery lifecycle (SDLC) and can give context to putting security into practice.

> Your job is to facilitate the business to operate in an as-assured-as-possible manner, given the actual mission of the business [and] [...] providing that context for people that aren’t security professionals as well as those that are: “Here’s how important this thing is in the grand scheme of things.”
>
> - [Bruce Potter](https://youtu.be/WKgD305OFAQ?t=1003)

To understand where to focus your efforts and communicate with management, it’s helpful to understand which assets your application is handling. Assets are valuable goods of physical or immaterial nature, e.g. production machines, order data, financial transactions, or personally identifying information. Assets should be evaluated in the context of the software to be built to later. This will enable you to understand how they might be attacked, as well as how/when/where to defend them — as well as the likely impact of a successful attack. In this sense, assets are targets for both deliberate and negligent threats both internally and externally. Assets are typically equally valuable for the company and attackers.

Let’s start with understanding an asset’s value. In most systems, value is created through transformation, indexing, contextualizing, or display of physical goods or real-world behavior. Examples include e-commerce systems, where customers order goods, fleet management solutions, warehouse solutions, user interaction analytics, or telemetry data. Another class of value creation is digital services, in which case instead of a singular physical good, the entirety of service delivery and user experience might constitute asset — for instance a streaming services. It’s our job to assure that this value can be realized.

The goal of a risk profiling exercise is to identify and understand the organizational impact of attacks or unforeseen/negligent failures in the context of software. To this end, understanding an asset gives insight into the corresponding security goals, which derive from either legal/regulatory requirements, or simply business experience. Security goals are: 

*   **Confidentiality** is a component of privacy that protects our data from disclosure to unauthorized parties.
*   **Integrity** of information refers to is the condition where information is kept accurate and consistent unless authorized changes are made. Typically, integrity refers to information being unchanged in transit, in storage and in usage not intended to modify the information.
*   **Availability** is the key for any information system to serve its purpose.Information must be available, obtainable and usable when needed. 

These security goals are referred to as the "CIA Triad". A notable example of the widespread usage of these terms is the European Union’s GDPR legislation. Security goals being broken results in a disaster scenario, which carry an impact to your business. These risks constitute your application’s risk profile.

Disaster scenarios will serve as the basis for our threat model, which allows us to understand ahead of time where attacks are likely to come from, what the attack is likely to look like, and what can go wrong at that point. It allows us to rationally discuss ways in which failure/attack patterns can harm the business.

For the software development life cycle, this means that the business stakeholders need to sit down with the delivery team. This joint task is a first step in creating a shared responsibility for security between the business and the delivery team.

Here is how such a risk profiling exercise could look:

*   Walk everyone through the functionality that you are about to build
*   Share context with stakeholders about what constitutes an asset
*   Have each stakeholder come up with a number of assets and cluster duplicate or closely-related assets
*   For every asset (or class of assets), ask the stakeholders about what happens in their business when the aspects of confidentiality, integrity, or availability are broken. At best, this can be stated as a monetary value, but often a relative size from “small” to “large” works just as well.

For example, an e-commerce shop, might class an order fulfillment system as an asset. Non-availability results in a revenue loss. Tampering with the integrity of order data would yield a similar scenario. For a health insurance company, patient health data is an asset which has to be kept secret, otherwise the company will be facing legal fines, public loss of trust, increased insurance premiums, identity theft, and potentially even drug fraud. 

While assigning a monetary value to impact in disaster scenarios is optional, it often comes in useful in later discussions.

**Asset libraries** allow us to make security-relevant decisions within application development based on business goals by creating a common language between the business and the delivery team. Written in natural language, they are _living documents_ that serve to answer the question what should be protected, and why.

If it is hard for you to find assets with corresponding business impact, as some teams are building rather technical solutions, you could start from the problem you're solving and any guarantees you're giving to the business in the process. As an example, you might be working on a team building a software that synchronizes payment data streams from different sources.  While these _individual_ data points you are working with might not be not valuable or secret in _isolation_, the company is dependent on the fact that you're synchronizing those data streams correctly, making the aggregated data is very valuable for the continued operation of the company.

**Sources** to quantify disaster scenarios often stem from business experience, jurisdiction, or analogies from similar events at other companies. Airlines might look at [British Airways' 2017 incident in Heathrow](https://www.theguardian.com/business/2017/may/29/ba-computer-crash-passengers-face-third-day-of-disruption-at-heathrow) to find the impact of a booking system being offline. E-commerce shops might look at Target to estimate the impact of criminals compromising PoS terminals. Insurances and data brokers might look at Equifax. News outlets and industry reports like [Verizon data breach report](https://enterprise.verizon.com/resources/reports/dbir/) or [Ponemon Data Breach studies](https://www.ponemon.org/news-2/23) have these examples readily available... and there will continue to be more for the foreseeable future.

In the engineering context, however, these models still do not readily yield action items on how to improve our overall security posture, which controls to implement, and where to implement them. This is done in a second step.


# Where does security happen?

To answer the question where security “happens” during software development, let’s take a look at how our teams create value. A **path to production** (P2P) visualizes the many steps between the start of a discussion, a business requirement, or a user ask, all the way up to the deployment and operation of a finished feature in a production environment.


![Threat Modeling Flow](/assets/images/threat-modeling-flow.svg)

The idea of a path to production is adapted from lean value stream mapping, which is used in the manufacturing industry to improve processes in production throughput and analyze the cost of delay. The creation of a P2P is a task that involves the whole team. Each and every activity in the context of product development is registered and brought into a logical order.

*   People: Groups, Boards, Individuals
*   Media: Meetings, Jour Fixe, Committees, Calls, eMails
*   Deliverables: Reports, Analyses, User Stories, Commits, Containers, …
*   Security controls alongside each step: Threat Modeling, Tests, Logging, Scanners, ...

Agile SDLCs will often roughly look like this: Stakeholders get together to discuss ideas, which are covered in protocols and reports. These inform decisions by other groups and committees down the road. At some point, these discussions will be refined into epics to roughly outline scopes for delivery work. Subsequently, an epic is broken down into stories, with a very clear scope and acceptance criteria. These stories are developed one at a time, and then deployed into production. 

In agile software development, this path is constantly fed with new proposals and insights. Typically, every team member is working in some point of the P2P at any given point in time. When all is said and done, you should be left with a huge piece of paper that shows the team’s reality abstract, but believably and accurately.

Here’s how such a **path-to-production session** will look in practice:


*   Have your _entire_ team present. Please note that it is of paramount importance that your Product Owner and Team Leads are there, not just the team. 
*   Prepare a blank wall or a large piece of paper where you can put sticky notes. From experience, you should have about 4 meters of usable space available
*   Have sticky notes in four colors ready, one color each for people, media, deliverables, and security controls
*   Start with the groups of people where input for your product comes from. This might be marketing, sales, expert groups. steering bodies, etc.. Then focus on who acts on the deliverables these groups produce, and where that information flows. These groups will be numerous, however many people in your team will be hearing about them for the first time.
*   When you are confident that you have captured those groups, move subsequently closer to where your team is becoming involved. Typically, there will be some kind of refinement meetings where the functional requirements are worked out, and possibly architecture groups that define cross-functional requirements for the software produced by the company’s teams.
*   Then, move on to capture the steps on you kanban board: When is a story going into development? How is that prioritized and picked up?
*   Subsequently, capture what happens in your continuous integration/deployment pipelines
*   Finally, how are your systems brought and kept operational? Is there a “firefighting team” for live support? Are there any logging or monitoring solutions you use? How do you feed information about your live systems behavior back into development? Is there a bug tracking workflow?

Please make sure to reserve at least 2 hours to create the path and 2 hours to discuss further steps (see subsequent sections). Be strict with the time-keeping.

P2Ps create a **shared responsibility** in the entire team and create a common understanding and empathy for the work of other team members which are crucial for shared ownership of security. Security work starts with the first discussions of features, long before a story appears on the kanban board.

In the next step, let us inspect the P2P for gaps in security controls: Threat modeling sessions when transitioning a story from "In Analysis" to "Ready for dev", automated tests, scanners, logging, monitoring, alerting, and many more. 


# // TODO Analysis Phase

In the analysis phase of our kanban wall, we break down chunks of requirements from a high-level business needs that outlines the desired functionality to stories, i.e. scoped pieces of work. In this context, we frame the technical setup to-be for the application in cross-functional requirements. Being able to add security concerns derived from the security goals and disaster scenarios of an asset library (as mentioned above) to the list of acceptance criteria is the paramount to developing secure software one story at a time. Security considerations taken in this phase have a high leverage for the following development. 

The purpose of **threat modeling** is to proactively identify potential issues in the technical design of the application. The practice includes both eliciting and managing threats. To this end, the technique of threat modeling is a good practice to help understand the cross-functional requirements that need to be scoped into the story and incorporated into the technical architecture. Threat modeling is based on a mature understanding of the consequences of an incident for the organization, which should be gathered in an **asset library**.

Threat models tie the delivery and assurance work within the team back to the management-layer of your organization involved in the risk profiling. Any response (or the absence of it) needs to be seen in the **context** of the business our products are supporting, having an impact on personnel, profitability, market capitalization, and many more. Hence, the decision on countermeasures is not taken in isolation within the product team, but needs to be in agreement with the business side of your organization.

The four typical courses of action are to **accept** (i.e. you have identified it, discussed, and logged it, but you choose to take no action), **avoid** (i.e. change your plans to avoid the risk), **transfer** (i.e. transfer the management of the risk to someone else), or **mitigate** (i.e. to limit the impact of a risk and/or reduce its likelihood). When confronted with a vulnerability, a common knee-jerk reaction for an engineer is to try and mitigate where possible. But that is not always necessary, as all of the above strategies are equally valid, depending on the context. A good threat model makes that context clear. Please note that **it is equally valid to mitigate the risk as it is to mitigate the outcome**. For example, the devops movement has brought an end to many of the most dearly-held assumptions of sysadmins optimizing for uptime, as servers crashing was downtime and machines were precious. Nowadays, machines are being provisioned on the fly in cloud environments and while the risk of downtime is still there, it is typically no longer the outcome of a single crash.

Either way, any action taken needs to be agreed upon by the business, e.g. the Product Owner. If such a decision has far-reaching consequences outside of the current story’s scope, keeping records is advised, e.g. in the form of [Lightweight Architecture Decision Records](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records).

In any case, adding a threat modeling session to the story readiness check is a good way to introduce threat modeling into your SDLC:

![Path to Production](/assets/images/path-to-production.svg)

This flowchart draws insights from the asset library and reviews whether appropriate controls are in place or need to be created in the context of the story.

In the following, we'll highlight ways to do threat modeling, depending on your desired outcome. It is good to know the advantages and drawbacks of these models ahead of time, especially when you are looking towards working with security professionals.

## Agile Threat Modeling

Our goal is to find the highest value security work we can do, and get it into the team’s backlog right away. We do this by applying a **timebox** so we are **threat modelling “little and often”**. We capture a new and different partial view of the system each time we do threat modelling rather than overthinking it. Over time, as we try lots of perspectives and zoom levels on the system, threat modelling becomes an agile continuous process!


*   Ask participants to draw technical diagram of agreed scope
*   Highlight what (data, services, assets) we need to protect
*   Evil Brainstorming of threats based on [STRIDE](https://docs.microsoft.com/en-us/previous-versions/commerce-server/ee823878(v=cs.20))
*   Prioritise by voting for riskiest threats
*   Work on the top three threats define actions (see below)

Brainstorming with **STRIDE** is quick & flexible to extend your existing ways of working and ask ‘what can go wrong?’. Shostack’s [STRIDE](https://docs.microsoft.com/en-us/previous-versions/commerce-server/ee823878(v=cs.20)) categorization is used to examine the current iteration’s functionality delta and whether it can be attacked or otherwise broken by applying the following attack patterns. STRIDE is an acronym for


*   **S**poofing identity allows attackers to do things they are not supposed to do by posing as someone else. Key Concepts are Identity, Authentication.
*   **T**ampering with input, e.b. by modifying data submitted to your system, can break a trust boundaries and modify the code flow decisions in your system? Key Concepts are Validation, Integrity, Injection.
*   **R**epudiation of action allows actors to use ambiguity to successfully dispute that they have committed an action, which means they cannot be held accountable for their actions. Key Concepts are Non-Repudiation, Logging, Audit.
*   **I**nformation disclosure threats involve the exposure or interception of information to unauthorised individuals. Key Concepts are Confidentiality, Encryption, Leakage, Man in the middle.
*   **D**enial of Service attacks work by flooding, wiping or otherwise breaking a particular service or system, making it unavailable. Key Concepts are Availability, Botnets, DDoS / DDoSaaS.
*   **E**scalation of Privilege attacks are possible when authorization boundaries are missing or inadequate, allowing a user to gain higher privileges than they should have. Key Concepts are Authorization, Isolation, Blast radius, Remote Code Execution.

**Please be rational** when coming up with attacks. Many threat modeling frameworks advise you to name a threat actor. Understanding the characteristics of threat actors and building some actor personae requires insight into their identity, relationship, motive, intent, capability. Personal experience shows that this is rather hard and work-intensive, but does not yield better results. Unless you’re likely to be attacked by the NSA, just keep it rational.

Map and order the findings according to their **impact** as explained in the **risk profiling** section: Take a moment to reflect on what is going to happen to the business in case this actually came to pass. Are you going out of business? Will you have to spend a day restoring your database? Will you lose a critical competitive advantage? Or is it possible that your elaborate disaster scenario actually turns out to be a minor nuisance at best?

The top threats can used as ...

*   Additional acceptance criteria on an existing user story
*   Security debt that is tracked in a shared place, e.g. a radiator on the wall of the team space
*   Changes to the team’s definition of done
*   Timeboxed spikes to determine if we are really vulnerable
*   Epics to implement significant security safeguards


## Tabletop Exercises

If the agile threat modeling approach is not for you, tabletop exercises are a starting point for **inexperienced teams** and to understand security risks in tech debt.

In a tabletop-like threat modeling, a team would be confronted with one or more disaster scenarios and would list all the necessary countermeasures to cover the phases in [NIST’s cybersecurity incident management](https://www.nist.gov/cyberframework): identify, protect, detect, respond and recover. This technique draws on **pre-existing knowledge** and **experience** of the team members from other engagements, and tries to **map** them to the current tech stack and architecture.

Sources for scenarios are likely to incorporate:

*   Boundaries and interfaces between systems that might break
*   Recovering from unavailability due to misconfiguration
*   Recovering from unexpected data loss
*   Gracefully degrading due to unavailability of third party services
*   Detecting intrusion and data leakage from outside attackers

Examples of tabletop scenarios:

*   A monitoring solution shows a large, sustained about of outbound traffic indicating data exfiltration
*   Crypto ransomware attack has occurred and infected a production system
*   Someone checked in their AWS access keys and all the sudden there's a lot of cryptocurrency mining going on
*   A laptop with access to intellectual property, data, credentials was stolen from them in an unlocked state when they were having coffee.
*   An unpatched server has been pwned and is part of a botnet.
*   Amazon sends an EC2 abuse notice saying that your EC2 instance has been SSH brute forcing targets outbound.
*   InfoSec sends you a message saying that your user account failed to authenticate over 1000 times in a 24 hour time frame.

## Attack Trees

Attack Trees are recommended when focussing on a critical component in the context of high-risk-high-yield assets, as well as in digital forensics. They are a methodology of analyzing the security of systems that allows for **top-down discovery of attack vectors** in a tree-like structure. They are very labor-intensive, require expert knowledge, but have limited payoff.

During conversations with security practitioners, a common theme was that attack trees lend themselves to **waterfall analysis** and **upfront design** in **high assurance environments**, and should be **avoided by agile teams**. 


# // TODO Development Phase

Many security controls in the development phase can be part of your automated CI/CD practices to contribute to the entire system stability. Examples like test pyramids and feature toggles are well-known and well-documented. However, a seldom discussed topic is scanning dependencies, libraries, frameworks, etc., despite them constituting the lion’s share of the codebase at runtime.

Semantic Versioning describes version ranges for floating dependencies, within which new releases can be automatically integrated. The expectation for floating version ranges is that upon the next build, bug fixes are automatically pulled from upstream and non-breaking updates are integrated without a manual intervention in configuration. This is a reasonable assumption, especially since most developers work exclusively fix-forward, instead of backporting releases. However, the result of **blindly integrating new untested releases** is broken builds and runtimes, non-deterministic builds, and the “works on my machine”-problem. Tools like Greenkeeper are a sign for increased **attention to dependencies**, as they integrate new versions and bug fixes automatically if the test suite executed by your CI is green. When your CI is green, deployment is the next step. Fitness for production is then usually tested through a blue/green deployment, which can be easily discarded or rolled back in case of an error. This practice is also known as “**Canary Build/Deployment**”. Should you not be using blue/green deployments, please make sure that you have **automated rollbacks** in place.

As the time goes on and new vulnerabilities are discovered, we need to safeguard against a growing number of **vulnerabilities in our libraries and frameworks** in **existing builds and live systems**. A prominent example is [Equifax’s Apache Struts vulnerability](https://arstechnica.com/information-technology/2017/09/massive-equifax-breach-caused-by-failure-to-patch-two-month-old-bug/) staying unpatched for months. Tools like [OWASP Dependency Checker](https://github.com/jeremylong/DependencyCheck) or [npm audit](https://docs.npmjs.com/cli/audit) scan dependencies for published “Common Vulnerabilities and Exposures”, security vulnerabilities that are published by the [Mitre Corporation](https://www.mitre.org) and other CVE Numbering Authorities, and other sources of published weaknesses, e.g. findings on [HackerOne](https://docs.hackerone.com/programs/cve-requests.html) or NIST’s [NVD](https://nvd.nist.gov). 

Same as libraries and frameworks, **containers** and **runtime environments** are also subject to having vulnerabilities and need to be **inspected regularly**. Tools like Clair and JFrog’s X-Ray allow scanning the layers in containers for CVEs. Scanning of dependencies and components is universally accepted as a good practice, so package managers (npm), repositories (jfrog, quay.io) often come with these capabilities out of the box. Scanners like Snyk, Twistlock, or Aqua with hooks into your CI/CD and production environments bring these tools and can provide these insights on an ongoing basis.

It is a good practice to continuously **check whether your dependencies are outdated or had CVEs discovered, e.g. once per day**. The recommendation is to have the notification on a separate pipeline that is executed as a cronjob, instead of being run only in your deployment pipeline. Not being able to deploy a fix to a production problem because there is a notification of a CVE or a newer version might not be a good situation to be in. Another advantage of running a security scan in a cronjob is that it is not uncommon for microservices to not be touched for months, when the deployment pipeline would not be running to alert you about newly discovered vulnerabilities.

This gives us a good picture about the state of security in development, now let’s look at live production support.


# // TODO Deployment and live support

At any point in time, you need to be able to **visualize the health of your system** in a dashboard. This is not about response times and other technical measures, but the ability of your system to serve the business. Your system is built along a user journey or different business focus points for which it creates value. You need to visualize every single one of them on a dashboard simultaneously, one aspect per tile.

For example, you would want to know the number of interactions with a shopping basket in an ecommerce scenario. Should this number ever suddenly drop, you know there might be a problem you're not detecting.

The basis for any kind of insight into your production environment is **structured logging**. Instead of logging a string in natural language, you log an indexable data structure. The log output of your container is consumed by a collector, aggregated at a central place, and indexed, so that in the event of an incident, you can pull up the logs and have the pre-formulated search queries ready that allow you to inspect this data. JSON Lines is a convenient format for storing structured data that may be processed one record at a time. The so-called ELK stack is a popular log analysis toolchain.

Now that we can aggregate the logs of different systems, we need to understand how to **correlate logs across systems**. This is possible with the use of a trace ID. You assign each external request a unique request id, e.g. via an HTTP header. This ID is passed on to all services that are involved in handling the request. The trace ID is included in all log messages. This allows you to pull up the interactions of different services to see which request cause which action or downstream error.

The crux of the matter lies in alerting, or rather in **distinguishing nominal from erroneous behavior**. Having dashboards that show the behavior of your system from a business perspective will allow you to learn this over time, the same way that pilots are using the dials in their cockpit to safely pilot the airplane. Sending out **alerts** comes in handy when you understand the operating conditions of your services, so that you can automatically ping your team when one of your services operates outside of these parameters.

When you receive an alert, you need to act. Looking at how emergency first responders are working, **Standard Operating Procedures** (SOPs) can help in keeping things straight when things get hectic. An SOP is a concise playbook or checklist that contains information that is necessary to deal with incidents. SOPs are not intended to be checklists that "dumb down" the problem at hand to the point where it can be run by anyone. It can contain procedures for restarting services, information on where to look for logs or procedures for handling data. SOPs are not a service manual that deal with any eventualities but more akin to emergency procedures that you see on an aircraft. The goal is to be able to react to incidents and outages largely independent of seniority, tenure, and experience.

The obvious examples are fire drills, as they show what to do to get out of the building. SOPs can take the form of paper-/wiki-based documentation, shell scripts, service interfaces, maintenance endpoints, and many more. 

Apart from using them in live support, they can be tested in **tabletop exercises** similar to the ones used in a tabletop exercise. This will make sure that the SOPs are commonly understood, state of the art, and actionable.

Also, set some resources aside to **aggressively pay off tech debt**, as this is the most common source of bugs. It helps to have a **one-person rotating firefighter role** that, when there’s no actual fire to fight, can pick up things from a tech debt wall and work on these many little tasks that rarely make it into a story. The emphasis is on "one person", since nothing drives **familiarity with the ugly parts of a codebase** like having to shepard a production system for a day when you’re new to a team. Do not pair senior and junior people, as it is likely that the senior person will be in the driver's seat most of the time. Giving everyone the task to keep the system operational for a day or two, regardless of experience and tenure, forces the team to take **collective ownership of all parts of the code**, regardless of how old or ugly the code is and who authored it.


# Security is a culture, not a means to an end

Even if efforts around security are often well received within the organization, please note that many teams will break new ground here. In order for the investment to pay off over a long period of time, it is beneficial to work closely with your business stakeholders. Only if the team understands their work in the context of the business, measures around security can be explained, justified, and agreed upon. Of course, this requires the business side's **willingness to invest around quality and security**.

This blog post illustrated some of the required steps to build security into your products from ground up. The goal is to create a product that is resilient against defects from the inside and attacks from the outside. Security aspects accompany every step of the SDLC.

_Now go forth and build securely!_
