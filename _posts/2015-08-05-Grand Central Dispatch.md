---
layout: post
title: Grand Central Dispatch
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: This was written way back in 2013 when the GCD was still new, but finally decided to put it on my blog since I kept coming back
---

NOTE: This was written way back in 2013 when the GCD was still new, but finally decided to put it on my blog since I kept coming back to it in discussions lately. Have fun. If something is outdated, please tell me about it.

## GCD...

* ... is short for **G**rand **C**entral **D**ispatch
* ... is a core technology to handle asynchrony and concurrency intuitively
* ... is pretty damn efficient
* ... relies on **blocks** and **dispatch queues**
* ... is a C-level API, works with ARC
* ... does not absolve you of common sense!(Know your kung fu!)
* ... does not absolve you of deadlocks! (Know your runtime state aforehand!)
* ... can create strong reference cycles with blocks! (Know your lifetime!)

### Blocks ...

* ... are awesome and dead-simple
* ... are an intuitive way to pass functions
* ... are anonymous functions pointers
* ... get their references right (also in non-ARC)
* ... automatically capture variables from enclosing scope
* ... have strong references to non-scoped variables
* ... for GCD have no arguments and no return values: ^{ }

### Queues ...

* ... are essentially a primitive list of blocks
* ... are simple data structures: Enqueue blocks for execution
* ... come in two flavors: Serialized queues (one block at a time) or concurrent queues (concurrency with respect to other queues)
* Concurrent Queues:
  * Execute multiple items in parallel
  * Dequeueing strongly FIFO, execution probably out of order
  * Most efficient parallel execution for system configuration

### Target Queues

* Dequeueing takes place in the target queues
* Set a target queue to a serial queue that synchronizes with the respective queue
* Target queues must be serial queues, behavior for concurrent target queues is undefined...
* GCD supports arbitrarily deep hierachies

### Dispatch barriers...

* ... are synchronization points
* ... will not run until all blocks submitted before are executed
* Blocks submitted later will not run until barrier block has completed

Typical use case: Reader/Writer scenarios

* Arbitrary number of multiple concurrent readers
* Exclusive access for writers

## How does it work?

Please find the code with examples below.

Retrieve well-known queues:

    dispatch_get_main_queue();
    dispatch_get_global_queue(prio, 0);
    DISPATCH_QUEUE_PRIORITY_DEFAULT/_LOW/_HIGH/_BACKGROUND

Create queues:

    dispatch_queue_create(label, attribute);
    DISPATCH_QUEUE_SERIAL/_CONCURRENT

Schedule for execution:

    dispatch_sync(queue, ^{ /*CODE*/ });
    dispatch_async(queue, ^{ /*CODE*/ });
    dispatch_after(delay, queue, ^{ /*CODE*/ });
    dispatch_apply(iterations, queue, ^(size_t i){ /*CODE*/ };

Suspend and resume queues:

    dispatch_suspend(queue);
    dispatch_resume(queue);

Set target queues:

    dispatch_set_target_queue(queue, target);

Insert dispatch barriers:

    dispatch_barrier_async(queue, /*CODE*/);
    dispatch_barrier_sync(queue, /*CODE*/);



#### Code Samples

main.m

    #import "HelloGCD.h"


    int main(int argc, const char * argv[])
    {
        @autoreleasepool {
            __block BOOL finished = NO;
            HelloGCD *helloGCD = [HelloGCD new];
            
            if (NO)
            {
                [helloGCD introduction:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD synchronousDispatchExample:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD serialQueueExample:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD concurrentQueueExample:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD delayedExecutionExample:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD multipleExecutionsExample:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD multipleParallelExecutionsExample:^{ finished = YES; }];
            }
            else if (YES)
            {
                [helloGCD dispatchBarrierExample:^{ finished = YES; }];
            }
            else if (NO)
            {
                [helloGCD lowHighPriorityExample:^{ finished = YES; }];
            }
            else
            {
                finished = YES;
            }
            
            [HelloGCD processMainRunloopUntilTestPasses:^BOOL{ return finished; }];
        }
        return 0;
    }

HelloGCD.h

    @interface HelloGCD : NSObject

    @property dispatch_queue_t serialQueue;
    @property dispatch_queue_t concurrentQueue;
    @property dispatch_queue_t lowPriorityQueue;
    @property dispatch_queue_t highPriorityQueue;

    + (void)processMainRunloopUntilTestPasses:(BOOL (^)())test;

    - (void)introduction:(void (^)())completionBlock;
    - (void)synchronousDispatchExample:(void (^)())completionBlock;
    - (void)serialQueueExample:(void (^)())completionBlock;
    - (void)concurrentQueueExample:(void (^)())completionBlock;
    - (void)delayedExecutionExample:(void (^)())completionBlock;
    - (void)multipleExecutionsExample:(void (^)())completionBlock;
    - (void)multipleParallelExecutionsExample:(void (^)())completionBlock;
    - (void)dispatchBarrierExample:(void (^)())completionBlock;
    - (void)lowHighPriorityExample:(void (^)())completionBlock;

    @end

HelloGCD.m

    #import "HelloGCD.h"

    @implementation HelloGCD

    + (void)processMainRunloopUntilTestPasses:(BOOL (^)())test
    {
        while (!test())
        {
            @autoreleasepool
            {
                [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate date]];
            }
        }
    }

    - (id)init
    {
        self = [super init];
        if (self)
        {
            // Basic GCD
            self.serialQueue = dispatch_queue_create("serialQueue", DISPATCH_QUEUE_SERIAL);
            self.concurrentQueue = dispatch_queue_create("concurrentQueue", DISPATCH_QUEUE_CONCURRENT);
            
            // Advanced GCD
            self.lowPriorityQueue = dispatch_queue_create("lowPriorityQueue", DISPATCH_QUEUE_SERIAL);
            self.highPriorityQueue = dispatch_queue_create("highPriorityQueue", DISPATCH_QUEUE_SERIAL);
            dispatch_set_target_queue(self.lowPriorityQueue, self.highPriorityQueue);
        }
        return self;
    }



    // Blocks basics

    - (void)introduction:(void (^)())completionBlock
    {
        NSLog(@"===== Blocks basics =====");

        NSInteger i = 0;
        void (^block0)() = ^{ NSLog(@"block 0: i = %ld", i); };

        i = 1;
        void (^block1)() = ^{ NSLog(@"block 1: i = %ld", i); };

        block0();
        block1();
        completionBlock();
    }


    // Basic GCD

    - (void)synchronousDispatchExample:(void (^)())completionBlock
    {
        NSLog(@"===== Synchronous Dispatching Example =====");

        for (NSInteger i = 0; i < 5; i++)
        {
            dispatch_sync(self.serialQueue, ^{ NSLog(@"block %ld", i); });
        }

        dispatch_sync(self.serialQueue, completionBlock);
    }

    - (void)serialQueueExample:(void (^)())completionBlock
    {
        NSLog(@"===== Serial Queue Asynchronous Dispatching Example =====");

        for (NSInteger i = 0; i < 5; i++)
        {
            dispatch_async(self.serialQueue, ^{ NSLog(@"block %ld", i); });
        }

        dispatch_async(self.serialQueue, completionBlock);
    }

    - (void)concurrentQueueExample:(void (^)())completionBlock
    {
        NSLog(@"===== Concurrent Queue Asynchronous Dispatching Example =====");

        for (NSInteger i = 0; i < 5; i++)
        {
            dispatch_async(self.concurrentQueue, ^{ NSLog(@"block %ld", i); });
        }

        dispatch_barrier_async(self.concurrentQueue, completionBlock);
    }



    // Advanced GCD

    - (void)delayedExecutionExample:(void (^)())completionBlock
    {
        NSLog(@"===== Delayed Execution Example =====");

        int64_t delayInSeconds = 2.0;
        dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, delayInSeconds * NSEC_PER_SEC);
        dispatch_after(popTime, self.serialQueue, ^(void){
            NSLog(@"sorry i am late...");
            completionBlock();
        });
    }

    - (void)multipleExecutionsExample:(void (^)())completionBlock
    {
        NSLog(@"===== Multiple Execution Example =====");
        dispatch_apply(5, self.serialQueue, ^(size_t i) { NSLog(@"scheduled %zd times", i); });
        completionBlock();
    }

    - (void)multipleParallelExecutionsExample:(void (^)())completionBlock
    {
        NSLog(@"===== Multiple Execution Example =====");
        dispatch_apply(5, self.concurrentQueue, ^(size_t i) { NSLog(@"scheduled %zd times", i); });
        completionBlock();
    }

    - (void)dispatchBarrierExample:(void (^)())completionBlock
    {
        NSLog(@"===== Dispatch Barrier Example =====");

        for (NSInteger i = 0; i < 5; i++)
        {
            dispatch_async(self.concurrentQueue, ^{ NSLog(@"reader %ld", i); });
        }

        dispatch_barrier_async(self.concurrentQueue, ^{ NSLog(@"writer"); });

        for (NSInteger i = 5; i < 10; i++)
        {
            dispatch_async(self.concurrentQueue, ^{ NSLog(@"reader %ld", i); });
        }

        dispatch_barrier_async(self.concurrentQueue, completionBlock);
    }


    - (void)lowHighPriorityExample:(void (^)())completionBlock
    {
        NSLog(@"===== Low/High Priority Example =====");

        for (NSInteger i = 0; i < 10; i++)
        {
            dispatch_async(self.lowPriorityQueue, ^{ NSLog(@"low priority block %ld", i); });
        }

        dispatch_suspend(self.lowPriorityQueue);
        dispatch_async(self.highPriorityQueue, ^{
            NSLog(@"high priority block");
            dispatch_resume(self.lowPriorityQueue);
        });

        dispatch_barrier_async(self.lowPriorityQueue, completionBlock);
    }

    @end

