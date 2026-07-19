---
title: "Hexo 的 Stellar 主题问题"
date: 2022-01-27T14:45:54+08:00
categories: ["技术"]
tags: ["Hexo","Stellar","博客"]
---
## 软件版本

相关的版本如下：

```
macOS: 10.15.7
Hexo: 5.4.0
hexo-cli: 4.3.0
node.js: 14.17.3 
npm: 6.14.13
stellar: 1.6.1
```

<!-- more -->

## 问题1： hexo g 生成问题

当我的post数量超过 6 时，使用hexo g 进行生成就会报下图中的错误，删掉一篇就能生成成功，尝试过换不同的post文章，基本能排除是某一个文章特殊内容的问题。

> 原文中的错误截图文件已经缺失，这里保留文字说明。
尝试过将 stellar 降级到 1.6.0 和 1.5.2 都出现相同错误。

后来尝试将_config.xml 中的主题切换成默认主题 languages ，执行 hexo g ，可以正常生成，然后又切回 stellar 主题，hexo g 正常了。后面间歇性的发生上图错误，来回切换下就正常了，很是奇怪。

## 问题2：运行时问题

post 文章加到了将近 20 篇时，hexo g 生成没有问题，hexo s 运行后，访问网页，不能正常显示，控制台出现如下错误：

```
INFO  Start processing
INFO  Hexo is running at http://localhost:4000 . Press Ctrl+C to stop.

<--- Last few GCs --->

[12722:0x110008000]    35949 ms: Scavenge 3974.7 (4103.6) -> 3974.6 (4104.6) MB, 7.9 / 0.0 ms  (average mu = 0.813, current mu = 0.672) allocation failure 
[12722:0x110008000]    35974 ms: Scavenge 3975.6 (4104.6) -> 3973.8 (4119.6) MB, 22.8 / 0.0 ms  (average mu = 0.813, current mu = 0.672) allocation failure 
[12722:0x110008000]    37751 ms: Mark-sweep 3988.7 (4119.6) -> 3986.5 (4135.6) MB, 1742.6 / 0.0 ms  (average mu = 0.656, current mu = 0.133) allocation failure scavenge might not succeed


<--- JS stacktrace --->

FATAL ERROR: MarkCompactCollector: young object promotion failed Allocation failed - JavaScript heap out of memory
 1: 0x10130c5e5 node::Abort() (.cold.1) [/usr/local/bin/node]
 2: 0x1000b2289 node::Abort() [/usr/local/bin/node]
 3: 0x1000b23ef node::OnFatalError(char const*, char const*) [/usr/local/bin/node]
 4: 0x1001f68c7 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [/usr/local/bin/node]
 5: 0x1001f6863 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [/usr/local/bin/node]
 6: 0x1003a47e5 v8::internal::Heap::FatalProcessOutOfMemory(char const*) [/usr/local/bin/node]
 7: 0x100400823 v8::internal::EvacuateNewSpaceVisitor::Visit(v8::internal::HeapObject, int) [/usr/local/bin/node]
 8: 0x1003e808b void v8::internal::LiveObjectVisitor::VisitBlackObjectsNoFail<v8::internal::EvacuateNewSpaceVisitor, v8::internal::MajorNonAtomicMarkingState>(v8::internal::MemoryChunk*, v8::internal::MajorNonAtomicMarkingState*, v8::internal::EvacuateNewSpaceVisitor*, v8::internal::LiveObjectVisitor::IterationMode) [/usr/local/bin/node]
 9: 0x1003e7bd5 v8::internal::FullEvacuator::RawEvacuatePage(v8::internal::MemoryChunk*, long*) [/usr/local/bin/node]
10: 0x1003e7916 v8::internal::Evacuator::EvacuatePage(v8::internal::MemoryChunk*) [/usr/local/bin/node]
11: 0x10040524e v8::internal::PageEvacuationTask::RunInParallel(v8::internal::ItemParallelJob::Task::Runner) [/usr/local/bin/node]
12: 0x1003bf202 v8::internal::ItemParallelJob::Task::RunInternal() [/usr/local/bin/node]
13: 0x1003bf688 v8::internal::ItemParallelJob::Run() [/usr/local/bin/node]
14: 0x1003e9985 void v8::internal::MarkCompactCollectorBase::CreateAndExecuteEvacuationTasks<v8::internal::FullEvacuator, v8::internal::MarkCompactCollector>(v8::internal::MarkCompactCollector*, v8::internal::ItemParallelJob*, v8::internal::MigrationObserver*, long) [/usr/local/bin/node]
15: 0x1003e9586 v8::internal::MarkCompactCollector::EvacuatePagesInParallel() [/usr/local/bin/node]
16: 0x1003d4cf7 v8::internal::MarkCompactCollector::Evacuate() [/usr/local/bin/node]
17: 0x1003d258b v8::internal::MarkCompactCollector::CollectGarbage() [/usr/local/bin/node]
18: 0x1003a4eab v8::internal::Heap::MarkCompact() [/usr/local/bin/node]
19: 0x1003a1499 v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::GCCallbackFlags) [/usr/local/bin/node]
20: 0x10039f2e0 v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/usr/local/bin/node]
21: 0x1003ad9ea v8::internal::Heap::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/usr/local/bin/node]
22: 0x1003ada71 v8::internal::Heap::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/usr/local/bin/node]
23: 0x100376cce v8::internal::FactoryBase<v8::internal::Factory>::NewRawTwoByteString(int, v8::internal::AllocationType) [/usr/local/bin/node]
24: 0x10078f54d v8::internal::IncrementalStringBuilder::Extend() [/usr/local/bin/node]
25: 0x1004bd9ad v8::internal::JsonStringifier::SerializeString(v8::internal::Handle<v8::internal::String>) [/usr/local/bin/node]
26: 0x1004c2458 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
27: 0x1004c07ee v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
28: 0x1004be856 v8::internal::JsonStringifier::SerializeArrayLikeSlow(v8::internal::Handle<v8::internal::JSReceiver>, unsigned int, unsigned int) [/usr/local/bin/node]
29: 0x1004c2805 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
30: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
31: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
32: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
33: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
34: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
35: 0x1004c07ee v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
36: 0x1004be856 v8::internal::JsonStringifier::SerializeArrayLikeSlow(v8::internal::Handle<v8::internal::JSReceiver>, unsigned int, unsigned int) [/usr/local/bin/node]
37: 0x1004c2805 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
38: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
39: 0x1004c07ee v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
40: 0x1004be856 v8::internal::JsonStringifier::SerializeArrayLikeSlow(v8::internal::Handle<v8::internal::JSReceiver>, unsigned int, unsigned int) [/usr/local/bin/node]
41: 0x1004c2805 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
42: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
43: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
44: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
45: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
46: 0x1004c07ee v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
47: 0x1004be856 v8::internal::JsonStringifier::SerializeArrayLikeSlow(v8::internal::Handle<v8::internal::JSReceiver>, unsigned int, unsigned int) [/usr/local/bin/node]
48: 0x1004c2805 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
49: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
50: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
51: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
52: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
53: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
54: 0x1004c07ee v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
55: 0x1004be856 v8::internal::JsonStringifier::SerializeArrayLikeSlow(v8::internal::Handle<v8::internal::JSReceiver>, unsigned int, unsigned int) [/usr/local/bin/node]
56: 0x1004c2805 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
57: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
58: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
59: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
60: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
61: 0x1004c4008 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
62: 0x1004c07ee v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
63: 0x1004be856 v8::internal::JsonStringifier::SerializeArrayLikeSlow(v8::internal::Handle<v8::internal::JSReceiver>, unsigned int, unsigned int) [/usr/local/bin/node]
64: 0x1004bf687 v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
65: 0x1004ba503 v8::internal::JsonStringify(v8::internal::Isolate*, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>) [/usr/local/bin/node]
66: 0x1002a0253 v8::internal::Builtin_JsonStringify(int, unsigned long*, v8::internal::Isolate*) [/usr/local/bin/node]
67: 0x100a81b59 Builtins_CEntry_Return1_DontSaveFPRegs_ArgvOnStack_BuiltinExit [/usr/local/bin/node]
68: 0x100a14839 Builtins_ArgumentsAdaptorTrampoline [/usr/local/bin/node]
69: 0x100a1a902 Builtins_InterpreterEntryTrampoline [/usr/local/bin/node]
zsh: abort      hexo s
```
