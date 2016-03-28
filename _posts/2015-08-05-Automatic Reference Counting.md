---
layout: post
title: Automatic Reference Counting
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: This was written way back in 2012 when manual memory management was still a thing, but finally decided to put it on my blog since
---

**NOTE**: This was written way back in 2012 when manual memory management was still a thing, but finally decided to put it on my blog since I kept coming back to it in discussions lately. Have fun. If something is outdated, please tell me about it.

1. Bird's-eye view
2. ARC in detail
3. How I learned to stop worrying and love the compiler.
4. Conclusion

## Bird's-eye view

### What is ARC?

ARC analyzes the lifetime of objects throughout your code. It enforces existing conventions and analyzes and optimizes your code based on these conventions. It also provides you with features that significantly reduce memory management problems.

* ARC is **not** a runtime environment
* ARC is **not** a garbage collector
* ARC will only take care of your ObjC stuff

### Why ARC?

Manual memory management ...

* is hard,
* complicated,
* leads to crashes (which ultimately leads to bad software quality),
* has some straightforward rules but lots of details, and
* has to be thoroughly thought through before writing it.

Apple has a tremendous toolchain, but I have rarely seen anyone use it:

* Instruments: Allocations, Leaks, Zombies, …
* Static Analyzer
* Debugger watchpoints
* …

### How does it work?

As the compiler goes through your code, it analyzes the lifetime of your objects and adds *retain*/*release*/*autorelease*. Example:

**Wrong**: Based on the API contract and coding conventions, it should return an NSString with retain count +0, aka. an *NSString* you do not take ownership of, aka. an autoreleased NSString. Yet, it doesn't…

	- (NSString*)greeting {
		return [[NSString alloc] initWithFormat:@"Hi %@", bloke.name];
	}

**Right**: The compiler will notice this and add retain/release/autorelease for you.

	- (NSString*)greeting {
		return [[[NSString alloc] initWithFormat:@"Hi %@", bloke.name] autorelease];
	}

### What do I do?

* You can stop thinking about what is happening in your memory. If you designed your code in a way that you had to explicitly think about keeping the memory intact instead of functional correctness, it was pretty fundamentally flawed anyway.
* You can start focussing on the correctness of your object graph instead. Keep an eye out for strong reference cycles and if you witness some, use \_\_weak references to break them.
* Take care when handling *void\** and *id* (more on that topic later…): Foundation is almost always preferrable to CoreFoundation
* Use autorelease pools via the literal and put it in a dedicated scope: *@autoreleasepool{…}*
* Eliminate dangling pointers via weak references, which automatically drop to *nil*.
* **Please do not try to optimize yourself, the compiler is better at it than you.**
* Scalar ivar properties should use *assign*.
* Properties that need to be retained or reference "down" the object hierarchy should use strong.
* Properties that reference "up" the object hierarchy should use weak. Additionally, when referencing "off" the object graph *weak* is the safest.
* In *dealloc*: Remove observers, unregister for notifications, set any non-weak delegates to nil, invalidate any timers with targets other than *self*.
* On a sidenote: Do not forget about memory management right away, for you may very well run into convoluted situations where you have to understand what is going on.

## ARC in detail

### Fundamentals

* *Blocks*: Blocks are a C language extension for creating anonymous functions. *Block pointers* are pointers to blocks.
* *void \** pointers are the typical C-style pointers.
* *Object pointer types* are a new type kind, which has two builtin members, *id* and *Class*; *id* is the final supertype of all object pointers. Users may define *classes*; each class is a *type*, and the *pointer* to that *type* is an *object pointer type*. A class may have a *superclass*; its *pointer type* is a *subtype of its superclass's pointer type*. A class has a set of *ivars*, fields which appear on all instances of that class. 
* For every class *T* there's an associated *metaclass*; it has no fields, its *superclass is the metaclass of T's superclass*, and its *metaclass is a global class*. Every *class* has a *global object* whose *class is the class's metaclass*; *metaclasses* have **no associated type**, so pointers to this object have type Class.
* A class declaration *@interface* declares a set of methods. A method has a *return type*, a *list of argument types*, and a *selector*.
* The target on which a method should be invoked on is called a *receiver*. If a method is invoked, it looks in the dynamic class of the receiver for a method with this name, then in that class's superclass, etc., until it finds something it can execute. 
* A *pointer value* is a *pattern of bits* indicating the *location* of a pointed-to object, *pointer objects* are locations in memory which *store pointer values*.

#### What does ARC not work with?

ARC does not work with C-style code, e.g. void-pointers, C-style arrays, or scalar values.

	- (void)foo: (int **)param; // it is not possible to safely distinguish between an array as an argument of a method and an out parameter
	void *foobar; //this is not a retainable object pointer…
	- (void *)do;  //this is not a retainable object pointer either…

#### Are there prerequisites for ARC to work?

* The type system must reliably identify which objects are to be managed.
* The type system must reliably indicate how to manage objects of a type.
* There must be reliable conventions for whether and when ownership is passed between caller and callee, for both arguments and return values.

Consequently, ARC only works in conjunction with retainable object pointers:

* Block pointers
* Objective-C object pointers
* *typedef*s marked with \_\_attribute\_\_((NSObject)). **This is not recommended!** If it's absolutely necessary to use this attribute, be very explicit about using the typedef, and do not assume that it will be preserved by language features like \_\_typeof and C++ template argument substitution.

#### What are those conventions ARC relies on?

ARC relies on the correctness of **method families**. A method is in a certain family, if

* it does not suffice the naming criteria and has an *objc_method_family* attribute in place,
* it does suffice the naming criteria and does **not** have an *objc_method_family* attribute placing it in a different or no family,
* its *selector* falls into the corresponding selector family, and
* its *signature* obeys the added restrictions of the method family.

A selector is in a certain selector family if, ignoring any leading underscores, the first component of the selector either consists entirely of the name of the method family or it begins with that name followed by a character other than a lowercase letter.

* *alloc* methods must return a retainable object pointer type.
* *copy* methods must return a retainable object pointer type.
* *mutableCopy* methods must return a retainable object pointer type.
* *new* methods must return a retainable object pointer type.
* *init* methods must be instance methods and must return an Objective-C pointer type. Additionally, a program is ill-formed if it declares or contains a call to an init method whose return type is neither id nor a pointer to a super-class or sub-class of the declaring class (if the method was declared on a class) or the static receiver type of the call (if it was declared on a protocol).
* A method may be annotated with the *objc_method_family* attribute to precisely control which method family it belongs to. If a method in an *@implementation* does not have this attribute, but there is a method declared in the corresponding *@interface* that does, then the attribute is copied to the declaration in the *@implementation*.

Methods in the *alloc*, *copy*, *mutableCopy*, and *new* families — that is, methods in all the currently-defined families except init — implicitly return a retained object. Methods in the init family implicitly *consume* their self parameter and return a retained object.

#### What are consumed parameters?

A function or method parameter of retainable object pointer type may be marked as **consumed**, signifying that the callee expects to take ownership of a +1 retain count.

	- (void) foo: (id) __attribute((ns_consumed)) x;

When **passing** such an argument, ARC **retains** the argument prior to making the call. When **receiving** such an argument, ARC **releases the argument at the end of the function**

#### Without retain in place, how can I signal ARC you want to return retained values?

A function or method which returns a retainable object pointer type may be marked as returning a retained value, signifying that the caller expects to take ownership of a +1 retain count. 

	- (id) foo __attribute((ns_returns_retained));

When returning from such a function or method, ARC retains the value at the point of evaluation of the return statement, before leaving all local scopes.

** Do I have to annotate init, copy, etc. as well? **

No. Methods in the alloc, copy, init, mutableCopy, and new families are implicitly marked
*\_\_attribute\_\_((ns_returns_retained))*.

#### How do I use CoreFoundation in an ARC environment? What about the toll-free bridged stuff?

There are three keywords to transfer objects in and out of ARC control:

*(\_\_bridge T) op* casts the operand to the destination type *T*. If *T* is a **retainable object pointer type**, then *op* must have a **non-retainable pointer type**. If *T* is a **non-retainable pointer type**, then *op* must have a **retainable object pointer type*. Otherwise the cast is ill-formed. There is no transfer of ownership, and ARC inserts no retain operations.

	CFStringRef foo = (__bridge CFStringRef)bar; //you have no ownership of bar
	NSString *bli = (__bridge NSString *)bla; //you have no ownership of bla

*(\_\_bridge_retained T) op* casts the operand, which must have **retainable object pointer type**, to the destination type, which must be a **non-retainable pointer type**. ARC **retains** the value and the recipient is responsible for balancing that +1. This is the typical 

	NSString *bar = [[NSString alloc] initWithString:@"trollolo!"];
	CFStringRef foo = (__bridge_retained CFStringRef)bar;

*(\_\_bridge_transfer T)* op casts the operand, which must have non-retainable pointer type, to the destination type, which must be a retainable object pointer type. ARC will release the value at the end of the enclosing full-expression.

	CFStringRef bar = CFStringCreateWithCString(NULL, "trollolo!", kCFStringEncodingMacRoman); // bar has a +1 retain count
	NSString *foo = (__bridge_transfer NSString *)bar; // As of here, ARC has seized control of the object

#### How do I express how I want to treat my objects?

In an ARC environment, there are four ownership qualifiers:

* \_\_strong
* \_\_weak
* \_\_autoreleasing
* \_\_unsafe_unretained

Those are appliccable to properties:

* assign implies \_\_unsafe_unretained ownership.
* copy implies \_\_strong ownership, as well as the usual behavior of copy semantics on the setter.
* retain implies \_\_strong ownership.
* strong implies \_\_strong ownership.
* unsafe_unretained implies \_\_unsafe_unretained ownership.
* weak implies \_\_weak ownership.

** What do those ownership qualifiers mean? **

The meaning is purely conventional, unless the properties are synthesized. When they are synthesized, an instance variable is created, assuming it does not already exist. If it already exists, its ownership qualifier must match the property's. If no ownership qualifier is given, it is implicitly **strong**. 

	@interface FooBar : NSObject
	{
    	__strong id _strongOr;
	    __weak id _weakOr;
	    __unsafe_unretained id _assignOr;
	    __weak id _failOr;
	}
	
	@property (strong) id strongOr;		// i am strong
	@property (weak) id weakOr; 		// i am weak
	@property (assign) id assignOr;		// i am unsafe_unretained/assign
	@property (strong) id failOr;		// i am a compilation error
	
	@end

** Those qualifiers are basically API contracts, so where do they really come into play? **

The qualifiers take effect in the five known managed operations:

* Reading
* Assignment
* Initialization
* Destruction
* Moving

** Reading **

* For \_\_weak objects, the current pointee is retained and then released at the end of the current full-expression. This must execute atomically with respect to assignments and to the final release of the pointee. 
* For all other objects, the lvalue is loaded with primitive semantics.

** Assignment **

* For \_\_strong objects, the new pointee is first retained; second, the lvalue is loaded with primitive semantics; third, the new pointee is stored into the lvalue with primitive semantics; and finally, the old pointee is released. This is not performed atomically; external synchronization must be used to make this safe in the face of concurrent loads and stores (Note: the *atomic* keyword).
* For \_\_weak objects, the lvalue is updated to point to the new pointee, unless the new pointee is an object currently undergoing deallocation, in which case the lvalue is updated to a null pointer. This must execute atomically with respect to other assignments to the object, to reads from the object, and to the final release of the new pointee.
* For \_\_unsafe_unretained objects, the new pointee is stored into the lvalue using primitive semantics.
* For \_\_autoreleasing objects, the new pointee is retained, autoreleased, and stored into the lvalue using primitive semantics.

** Initialization **

1. First, a null pointer is stored into the lvalue using primitive semantics. This step is skipped if the object is \_\_unsafe_unretained.
2. Second, if the object has an initializer, that expression is evaluated and then assigned into the object using the usual assignment semantics.

**Destruction** occurs when an object's lifetime ends. In all cases it is semantically equivalent to assigning a null pointer to the object, with the proviso that of course the object cannot be legally read after the object's lifetime ends.

**Moving** occurs in specific situations where an lvalue is moved from, meaning that its current pointee will be used but the object may be left in a different (but still valid) state. This arises with \_\_block variables and rvalue references in C++. For \_\_strong lvalues, moving is equivalent to loading the lvalue with primitive semantics, writing a null pointer to it with primitive semantics, and then releasing the result of the load at the end of the current full-expression. For all other lvalues, moving is equivalent to reading the object.

** How does that stuff work in practice?! **

Let's take the simple example where an object is assigned to a weak object and then there is a read operation:

	__weak NSString *weakName = name;
	char c = [weakName characterAtIndex:0];
	
After ARC is done, this expands to:
	
	__weak NSString *weakName = nil;
	objc_storeWeak(&weakName, name);
	char c = [objc_readWeak(&weakName) characterAtIndex: 0];
	objc_storeWeak(&weakName, nil);
The runtime methods are designed in a way that allows pretty ruthless optimization, the result is that there are possibly very large chunks of code that are entirely eliminated during optimization.

#### Are there good practices to avoid strong reference cycles?

There is one pretty simple rule: 

* References **down** the object graph (e.g. parent -> child) are strong,
* Referenced **up** the opbject graph (e.g. child -> parent) are weak.

A retain cycle A -> B -> C -> A with \_\_strong references can easily be broken be making one of the references \_\_weak. Therefore delegates are in general \_\_weak.

#### Should I still try to optimize my code manually?

No, please leave that to the compiler. Instead, focus on writing "natural code".

#### Are all variables initialized with nil?

Yes. There's no need to do this manually.

## How I learned to stop worrying and love the compiler.

If you are confused now, please re-read section 2. If you feel like you can take a bit more and want to know about how ARC handles passing out-parameters in a writeback, please continue.

### Passing out-parameters by writeback

** What is a writeback?! **

A writeback is what you intend when you do "this pointer-to-pointer thingy":

	- (void)doStuff:(NSError **)error;
	- (BOOL)oneReturn:(NSObject **)object valueIsNot:(NSObject **)anotherObject enough:(NSObject **)yetAnotherObject;

You will most likely agree that it is close to impossible for the compiler to determine if those are **out-parameters** or just convoluted, but perfectly fine, indirect parameters. So, there was a little workaround. If a function or method parameter has type T*, where T is an ownership-unqualified retainable object pointer type, then:

* if T is const-qualified or Class, then it is implicitly qualified with __unsafe_unretained;
* otherwise, it is implicitly qualified with __autoreleasing.

It was stated before, that \_\_strong is automatically inferred in case no other ownership qualifier is in place. However, **this is not the case for indirect parameters**! In this case \_\_autoreleasing is inferred. The rationale for this is not to break with backward compatibility. So this is what the compiler sees:

	- (void)doStuff:(NSError * __autoreleasing *)error;

If the argument passed to a parameter of type T \_\_autoreleasing * has type U oq *, where oq is an ownership qualifier, then the argument is a candidate for pass-by-writeback if:

* oq is \_\_strong or \_\_weak, and
* it would be legal to initialize a T \_\_strong * with a U \_\_strong *.

** WTF? **

Let's read some more from the documentation… A pass-by-writeback is evaluated as follows:

* The argument is evaluated to yield a pointer p of type U oq *.
* If p is a null pointer, then a null pointer is passed as the argument, and no further work is required for the pass-by-writeback.
* Otherwise, a temporary of type T __autoreleasing is created and initialized to a null pointer.
* If the parameter is not an Objective-C method parameter marked out, then *p is read, and the result is written into the temporary with primitive semantics.
* The address of the temporary is passed as the argument to the actual call.
* After the call completes, the temporary is loaded with primitive semantics, and that value is assigned into *p.

You must not create ARC code with unknown ownership, hence ARC simply handles it by itself. The method described above is the "least bad solution". 

** WTF??? Example, please! **

**Have a look at the code sample at the end of the blog post!**
 
Here are the logs:

	// CASE 1: Strong local variable passed by autoreleasing reference
	01: >> start!
	02: Strong local passed by autoreleasing reference
	03: ##### init 0x100300210
	04: local: address 0x7fff5fbff808, contains 0x100300210 - <Breadcrumbs: 0x100300210>, owners 1
	05: autoreleasingIndirect: passed reference 0x7fff5fbff800, contains 0x100300210 - <Breadcrumbs: 0x100300210>, owners 1

As we expected, ARC created a hidden *\_\_autoreleasing* variable and copied the value. If you ask yourself what happens to the original value in the meantime: It is guaranteed to live through the current scope we're in, so ARC doesn't need to do retain anything.

	06: ##### init 0x103800030
	07: ##### autorelease 0x103800030

This is standard procedure, nothing fancy here.

	08: autoreleasingIndirect: returned
	09: ##### retain 0x103800030
	10: ##### release 0x100300210
	11: ##### dealloc 0x100300210

The call returned, the contents of the hidden variable are copied and and everything is put in the state you would expect: Retain the new value, release the old value, assign it.

	12: local: address 0x7fff5fbff808, contains 0x103800030 - <Breadcrumbs: 0x103800030>, owners 2

The *\_\_autoreleasing* reference has not yet disappeared, hence the variable has two owners.

	13: ##### release 0x103800030

… aaaaaaand it's gone.

	14: >> autorelease pool pop!
	15: ##### release 0x103800030
	16: ##### dealloc 0x103800030
	17: >> end!

Well, this was surprisingly simple once you understand the concept. So much about local values and autoreleasing variables. What happens if a pass a *\_\_strong* ivar? 

Pass-by-writeback with __autoreleasing indirect variables does not work for ivars. This is due to conflicting ownership qualifiers. There are two ways to get around that issue: Copy your ivar into a local variable and use the above example, or add \_\_strong ownership qualifier to the argument.

	// CASE 2: Strong ivar passed by strong reference
	01: >> start!
	02: Strong instance passed by strong reference
	03: ##### init 0x1003004c0
	04: instance: addr 0x1001141f8, contains 0x1003004c0 - <Breadcrumbs: 0x1003004c0>, owners 1
	05: strongIndirect: passed reference 0x1001141f8, contains 0x1003004c0 - <Breadcrumbs: 0x1003004c0>, owners 1

Question: Wait, why is here no copying or hidden variables? Answer: The ivar is strong, we're good here.

	06: ##### init 0x100300530
	07: ##### release 0x1003004c0
	08: ##### dealloc 0x1003004c0
	09: strongIndirect: returned
	10: instance: addr 0x1001141f8, contains 0x100300530 - <Breadcrumbs: 0x100300530>, owners 1
	11: >> autorelease pool pop!
	12: ##### release 0x100300530
	13: ##### dealloc 0x100300530
	14: >> end!

This was surprisingly simple. But there is one more case left. We pass a strong local by a strong reference

	// CASE 3: Strong local passed by strong reference
	01: >> start!
	02: Strong local passed by strong reference
	03: ##### init 0x100114230
	04: local: addr 0x7fff5fbff808, contains 0x100114230 - <Breadcrumbs: 0x100114230>, owners 1
	05: strongIndirect: passed reference 0x7fff5fbff808, contains 0x100114230 - <Breadcrumbs: 0x100114230>, owners 1
	06: ##### init 0x100114240
	07: ##### release 0x100114230
	08: ##### dealloc 0x100114230
	09: strongIndirect: returned
	10: local: addr 0x7fff5fbff808, contains 0x100114240 - <Breadcrumbs: 0x100114240>, owners 1
	11: ##### release 0x100114240
	12: ##### dealloc 0x100114240
	13: >> autorelease pool pop!
	14: >> end!

As you may have expected, there is no unexpected behaviour here. The compiler just does the right thing :)

** Congratulations! You have reached checkpoint #3 "ARC or: How I learned to stop worrying and love the compiler." **

## Conclusion

The above examples show that you are pretty much safe, no matter what you do, as long as it makes sense. So here are some findings for ARC environments:

* The semantics behind ARC's *\_\_weak* ownership qualifier do away with dangling pointers as one of the most prominent causes for crashing apps.
* If your code doesn't work, it's NOT the compiler that is broken. Go and fix your code.
* Seriously, it's **not** the compiler.
* Even though that is barely impossible, there are still ways to confuse the compiler. Yes, this mostly happens because you just did things wrong. Most of what you think is erroneous behavior on the part of the compiler, is "just" you failing to understand what your code evaluates to at runtime. So we're back at you rethinking your code.
* You can still produce strong reference cycles, ARC will not fix your self-inflicted errors. If your object graph is broken, go and fix it and stop thinking about what's happening in the memory.
* ARC will lower the high-watermark of your code.
* ARC can lead to worse performance in Debug configurations as the optimizer is not generally run there. Expect to see more retain/release traffic that would be gone after proper optimizing.
* On a semi-related note: Apple trusts ARC so much it deprecated GC on Mountain Lion :)
* There are Foundation classes that do not yet support ARC's *\_\_weak* ownership qualifier. So far I only know of NSProxy, but be aware of that! This comes into play when you use OCMock in conjunction with ARC, see [OCMock problems with ARC on stackoverflow.com](http://stackoverflow.com/questions/9104544/how-can-i-get-ocmock-under-arc-to-stop-nilling-an-nsproxy-subclass-set-using-a-w)

## Sources

* [Apple Developer - WWDC 2012](https://developer.apple.com/videos/wwdc/2012/) - Session 406: Adopting Automatic Reference Counting
* [Apple Developer - WWDC 2012](https://developer.apple.com/videos/wwdc/2012/) - Session 405: Modern Objective-C
* [Apple Developer - WWDC 2012](https://developer.apple.com/videos/wwdc/2012/) - Session 413: Migrating to Modern Objective-C
* [Apple Developer - Transitioning to ARC Release Notes](http://developer.apple.com/library/ios/#releasenotes/ObjectiveC/RN-TransitioningToARC/Introduction/Introduction.html#//apple_ref/doc/uid/TP40011226)
* [LLVM Documentation](http://clang.llvm.org/docs/AutomaticReferenceCounting.html)
* [Mike Ash - Friday Q&A 2011-09-30: Automatic Reference Counting](http://www.mikeash.com/pyblog/friday-qa-2011-09-30-automatic-reference-counting.html)
* [Pass-by-writeback auf stackoverflow.com](http://stackoverflow.com/questions/8814718/handling-pointer-to-pointer-ownership-issues-in-arc)
* [ARC vs out-parameters](http://stackoverflow.com/questions/7740420/out-parameters-in-arc-objective-c)
* [ARC Gotcha – Unexpectedly Short Lifetimes](http://weblog.bignerdranch.com/296-arc-gotcha-unexpectedly-short-lifetimes/)
* [ARC best practices](http://amattn.com/2011/12/07/arc_best_practices.html) <- Attention, contains minor errors

## Epilogue

Just in case your did not yet undergo complete cognitive overload, here's more from the mastermind of WTF:

* [Mike Ash - Introducing MAZeroingWeakRef](http://mikeash.com/pyblog/introducing-mazeroingweakref.html)
* [Mike Ash - Introducing PLWeakCompatibility](http://mikeash.com/pyblog/introducing-plweakcompatibility.html)
* [Mike Ash - Friday Q&A 2012-05-18: A Tour of PLWeakCompatibility: Part I](http://mikeash.com/pyblog/friday-qa-2012-05-18-a-tour-of-plweakcompatibility-part-i.html)
* [Mike Ash - Friday Q&A 2012-06-01: A Tour of PLWeakCompatibility: Part II](http://mikeash.com/pyblog/friday-qa-2012-06-01-a-tour-of-plweakcompatibility-part-ii.html)


## Code

main.m

    #import "Tester.h"

    int main(int argc, const char * argv[])
    {

        // CASE 1: Strong local variable passed by autoreleasing reference
        if (YES)
        {
            NSLog(@">> start!");
            Tester *test = [Tester new];
            @autoreleasepool
            {
                [test strongLocalPassedByAutoreleasingReference];
                NSLog(@">> autorelease pool pop!");
            }
            NSLog(@">> end!");
        }


        // CASE 2: Strong ivar passed by strong reference
        if (NO)
        {
            NSLog(@">> start!");
            @autoreleasepool {
                Tester *test = [Tester new];
                [test strongInstancePassedByStrongReference];
                NSLog(@">> autorelease pool pop!");
            }
            NSLog(@">> end!");
        }


        // CASE 3: Strong local passed by strong reference
        if (NO)
        {
            NSLog(@">> start!");
            @autoreleasepool {
                Tester *test = [Tester new];
                [test strongLocalPassedByStrongReference];
                NSLog(@">> autorelease pool pop!");
            }
            NSLog(@">> end!");
        }
        return 0;
    }


Tester.h

    #import "Breadcrumbs.h"

    @interface Tester : NSObject

    - (void)strongLocalPassedByAutoreleasingReference;
    - (void)strongInstancePassedByStrongReference;
    - (void)strongLocalPassedByStrongReference;

    @end

Tester.m

    #import "Tester.h"

    @implementation Tester
    {
        Breadcrumbs *_bc; // __strong inferred
    }



    #pragma mark - test methods

    - (void)strongLocalPassedByAutoreleasingReference
    {
        NSLog(@"Strong local passed by autoreleasing reference");
        Breadcrumbs *local = [Breadcrumbs new]; // __strong inferred
        NSLog(@"local: address %p, contains %p - %@, owners %ld", &local, local, local, [local owners]);
        [self autoreleasingIndirect:&local];
        NSLog(@"local: address %p, contains %p - %@, owners %ld", &local, local, local, [local owners]);
    }

    - (void)strongInstancePassedByStrongReference
    {
        NSLog(@"Strong instance passed by strong reference");
        _bc = [Breadcrumbs new];
        NSLog(@"instance: addr %p, contains %p - %@, owners %ld", &_bc, _bc, _bc, [_bc owners]);
        [self strongIndirect:&_bc];
        NSLog(@"instance: addr %p, contains %p - %@, owners %ld", &_bc, _bc, _bc, [_bc owners]);
    }

    - (void)strongLocalPassedByStrongReference
    {
        NSLog(@"Strong local passed by strong reference");
        Breadcrumbs *local = [Breadcrumbs new]; // __strong inferred
        NSLog(@"local: addr %p, contains %p - %@, owners %ld", &local, local, local, [local owners]);
        [self strongIndirect:&local];
        NSLog(@"local: addr %p, contains %p - %@, owners %ld", &local, local, local, [local owners]);
    }



    #pragma mark - manipulation methods

    - (void)strongIndirect:(Breadcrumbs * __strong *)indirect
    {
        NSLog(@"strongIndirect: passed reference %p, contains %p - %@, owners %lu", indirect, *indirect, *indirect, [*indirect owners]);
        [self concreteStrongIndirect:indirect];
        NSLog(@"strongIndirect: returned");
    }

    - (void)concreteStrongIndirect:(Breadcrumbs * __strong *)indirect
    {
        *indirect = [Breadcrumbs new];
    }


    - (void)autoreleasingIndirect:(Breadcrumbs **)indirect // __autoreleasing inferred
    {
        NSLog(@"autoreleasingIndirect: passed reference %p, contains %p - %@, owners %ld", indirect, *indirect, *indirect, [*indirect owners]);
        [self concreteAutoreleasingIndirect:indirect];
        NSLog(@"autoreleasingIndirect: returned");
    }

    - (void)concreteAutoreleasingIndirect:(Breadcrumbs **)indirect
    {
        *indirect = [Breadcrumbs new];
    }

    @end

Breadcrumbs.h

    /*
     THIS CLASS MUST NOT BE COMPILED IN ARC,
     SINCE ARC DOES NOT ALLOW OVERRIDES OF
     MEMORY MANAGEMENT OPERATIONS OR USAGE
     of -retainCount!
     */
    @interface Breadcrumbs : NSObject

    - (NSUInteger)owners;

    @end

Breadcrumbs.m

    #import "Breadcrumbs.h"

    @implementation Breadcrumbs

    - (id)init
    {
        self = [super init];
        if (self)
        {
            NSLog(@"##### init %p", self);
        }
        return self;
    }

    - (id)retain
    {
        NSLog(@"##### retain %p", self);
        return [super retain];
    }

    - (oneway void)release
    {
        NSLog(@"##### release %p", self);
        [super release];
    }

    - (void)dealloc
    {
        NSLog(@"##### dealloc %p", self);
        [super dealloc];
    }

    - (id)autorelease
    {
        NSLog(@"##### autorelease %p", self);
        return [super autorelease];
    }

    - (NSUInteger)owners
    {
        return [self retainCount];
    }

    @end

