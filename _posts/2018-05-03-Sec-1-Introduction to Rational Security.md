---
layout: post
title: An Introduction to Rational Security
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: This is the first post of the Rational Security series, in which we introduce tools to rationally reason about the security requirements of the systems we build. In this post, we are taking a closer look at why we're still building systems that suck and why we're fetishizing the attacks instead of thinking rationally
---

In this first post, i'll start from a 30000 feet management level view, and we'll dig deeper into the details as we go along. Let's start our journey towards a rational understanding of security by taking inventory of *where* we are, *why* we want to challenge the status quo, and *where we want to go*. At the core of my assumptions is that nobody ever sets out to build an insecure product. It just so happens that our requirements, architecture, stakeholders, etc. evolve, which is why we've largely resorted to agile practices. As we're wandering into the unknown, we need to adapt --- which includes taking our security practices out of the pre-agile world and into the 21st century.

## Where did we go wrong?

To answer this question, let's take a look at why practices like Design Thinking, Lean Startup, and more recently DevOps. What all of them have in common is introducing their specific practices earlier in the product development. Design Thinking brings a focus on *fitness for use*, Lean Startup methodology brings *product-market-fit*, and and DevOps aims to *tear down the artificial organizational separation* between platforms, infrastructure, and software. One thing all of them have one thing in common is delaying decisions to an appropriate time when we have the insight necessary to make a meaningful decision, thus reducing the impact of uncertainty. Another thing they have in common is that they get involved earlier in the process, so that the learnings can be incorporated into the product while it is being developed. This transforms the product development life cycle into an intellectual journey as opposed to a streamlined process. There is no good reason why we shouldn't be doing this with our security considerations as well.

A net contributor to the mess we're currently in is the so-called **security sandwich**. When we start an engagement, we typically start out with good intentions, security requirements, compliance rules, obligations, infrastructure hardening requirements, etc. Some of these things are contractual and would be agreed upon before the first delivery team enters the scene. It would be documented, filed, only to never be heard from again. Albeit worthless, the way security has been orchestrated is by writing a security architecture up front. Worthless, since most aspects of your product are not known at day zero. This approach forces us to account for risks that haven't even been discovered, with unclear scope, with little knowledge about the business domain, in short: Security without any sane frame of reference. 

Development then brings its own flurry of changes, where security takes the backseat to architectural change, feature pressure, scope creep, team churn, etc. Think about it in the way that we've initally started to build a bicycle, however at some point it was decided that it needs to become an airliner that carries 200 people safely over the atlantic ocean. Both has wheels, so it can't be that hard, can it?

And then some time later, we go live. Traditionally, this was the dreaded first time that people within the org will see your software and an actual end user lays their hands on it. In that case, we see things like acceptance tests, where stakeholders are test-driving the software out for a day or two. Other typical things happening at this stage are *penetration tests* and *code audits*. This process may take anywhere between a couple of weeks and to several months.

In the early 2000s, the general idea was that if only we have enough firewalls in place, we could jerry-rig our way out of this constant game of catch-up with attack vectors. Which increased the complexity of our networks, which then again proved that complexity is the sworn enemy of any security effort.

To make a long story short: Security as an afterthought is a lot harder to do and less effective in such a reactive setting than tackling it proactively. With modern software engineering practices, the boundaries blur — and that's the place where pen testers live. We need to understand that the systems we're building are composite systems. Our applications depend on the same networks to access their resources and exchange information, that an attacker would use to exploit them. In a composite systems, there is no such thing as a gate, on which you could place perimeter guards. In an enterprise, making stuff work is rewarded. Making stuff secure is not inside this definition. There currently seems to be very little incentive to do things right, as the market does seem to reward the early birds that just made it work.

So let's try to articulate what would need to happen.

## Quo vadis?

When I said initially that we need to stop fetishizing the attacks, I mean that we need to approach security rationally, instead of falling into security nihilism, which assumes that a) attacks are *always catastrophic* and carried out by an *omnipotent attackers*, and b) *security is binary*, i.e. you either get full security or none at all. It takes a system that does not have to rely on people on the inside doing the right thing all the time! To do this, an organization needs to *empower* its teams to take the appropriate measures instead of squeezing every last feature out of the dev teams, a degree of *maturity* in your engineering organization and a solid *understanding* of the security- and business-domain that we are modeling. Since engineers seldom operate on their own, including the non-technical roles in our teams becomes paramount, e.g. the Product Owner, Business Analysts. It might be helpful to visualize our journey as on the achievement of five progressively more capable states of security (Shoemaker, 2009):

The first state is **recognition**. Most often, we come from a place of *fear*, *uncertainty*, and *doubt* (FUD). We have this lingering feeling that we need to change something, but we're not exactly sure, what that is. More and more of our organizations operate digitally, which means that our exposure to technology has dramatically increased. As software professionals, it is our job to ensure that the organization can operate as safely as possible. We recognize the need for transforming our security practices into something more actionable. The fact that you are reading this blog post is testament to that.

The second state is **informal realization**. When we're passing this state, we understand and routinely apply informal security practices, often on an ad hoc basis. My hope is to get you to this point.

The third state is **security understanding**, where we plan and monitor our activities around security. This is about as far as I can possibly get you by reading a bunch of blog posts. In an organization, this requires taking executives along and educating them on the the business consequences, and implementing monitoring and control functions, and another for workers aimed at ensuring that good practices are followed.

The next state is **deliberate control**, i.e. institutionalized software assurance response that is built around providing a tailored set of skills for each relevant position. This state comprises a targeted mix of training and education. The outcome provides a very high level of carefully controlled assurance.

Organizations at the level of **continuous adaptation** are capable of adapting to new threats as they arise as they continue to evolve those practices as conditions change. That requires a high level of knowledge of the elements and requirements of the field, as well as the thought processes to allow people to adapt these principles. Educational program and skill training get you far, however the integrating that knowledge into the capability to respond correctly to new or unanticipated events allows for mastery.

## What do we need to do?

The direction we're heading has been dubbed DevOpsSec, with the intent being to *shift security left* to an earlier stage in the software development life cycle. It boils down to **building security in instead of bolting it on**, all while acknowleding and embracing the complexity of building a product.

The most crucial part about approaching security rationally is probably around **empowerment**. The team owns the security aspects of its product(s). This requires a solid level of maturity inside the team and technical proficiency among the team members. This will probably lead to an evolution in the team's communications and ceremonies. Security requirements and the decisions around them need to be tracked and shared in stories and requirements documents, radiators, team ceremonies, etc. It is important to understand that while the team collectively *owns* the security aspects, it's every individual's responsibility to work proactively. All of this transforms the infosec department's job from a traditional gatekeeper into a more **proactive** role, where infosec *pushes* in terms of **awareness and advisory**, but the teams *pull* where they need **help and advice**.

Without the rigors of continuous integration and continuous deployment and a robust test pyramid, we can't reasonably build security in. A team needs to be able to express their security decisions in code and has to be able to **automate** them. Building security in is not about achieving maximum uptime, but rather about accepting that things can and will go wrong and accounting for it by excelling in rapid **detection**, **response**, **recovery**, and **learning from failure**. As such, engineering for resilience helps to achieve more adaptive systems where the teams are in control, because they understand what is happening at any point in time, and are able to responde in a timely manner. In order to achieve that, we need to bring in a sane amount of logging and monitoring, as well as the visualization around it. That being said, there is a place and a time for penetration testing, white/black-box testing, and other specialized manual exploratory tests, which is *on the narrow top of a well-shaped test pyramid*.

Now that we have understood where we come from and what security is about, let's take a look at [high-level threat modeling in the next post of the Rational Security series](https://felixhammerl.com/2018/05/03/Sec-2-High-Level-Threat-Modeling.html).

## References

Shoemaker, [*It’s a Nice Idea but How Do We Get Anyone to Practice It?*](https://www.us-cert.gov/bsi/articles/knowledge/business-case-models/its-a-nice-idea-but-how-do-we-get-anyone-to-practice-it), 2009

