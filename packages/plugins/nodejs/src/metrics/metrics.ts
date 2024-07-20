/**
 *  Offer the listed metrics for the node.js plugin
 *  Source: https://github.com/siimon/prom-client/tree/master/lib/metrics
 *  ###################################################################
 *  Copyright 2015 Simon Nyberg
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { createInstanceFromRawMetric } from '@quickstat/core'

import type { RawMetricType } from '@quickstat/core'

/**
 * The available metrics for the node.js plugin
 */
export type NODEJS_AVAILABLE_METRICS =
    'nodejs_event_loop_lag' // The event loop lag in seconds.
    | 'nodejs_gc_duration' // The duration of the garbage collection in seconds.
    | 'nodejs_heap_size_total' // The total heap size in bytes.
    | 'nodejs_heap_size_used' // The used heap size in bytes.
    | 'nodejs_external_memory' // The external memory size in bytes.
    | 'nodejs_heap_space_size_total' // The total heap space size in bytes.
    | 'nodejs_heap_space_size_used' // The used heap space size in bytes.
    | 'nodejs_heap_space_size_available' // The available heap space size in bytes.
    | 'nodejs_process_resident_memory' // The resident memory size in bytes.
    | 'nodejs_process_virtual_memory' // The virtual memory size in bytes.
    | 'nodejs_process_heap_memory' // The heap memory size in bytes.
    | 'nodejs_process_cpu_user_total' // The total user CPU time in seconds.
    | 'nodejs_process_cpu_system_total' // The total system CPU time in seconds.
    | 'nodejs_process_cpu_total' // The total CPU time in seconds.
    | 'nodejs_active_handles' // The number of active handles.
    | 'nodejs_active_handles_total' // The total number of active handles.
    | 'nodejs_process_max_fds' // The maximum number of file descriptors.
    | 'nodejs_process_open_fds' // The number of open file descriptors.
    | 'nodejs_active_requests' // The number of active requests.
    | 'nodejs_active_requests_total' // The total number of active requests.
    | 'nodejs_active_resources' // The number of active resources.
    | 'nodejs_active_resources_total' // The total number of active resources.
    | 'nodejs_start_time' // The start time of the node.js process in seconds.
    | 'nodejs_version' // The version of the node.js process.


/**
 * The raw metric type for the node.js plugin
 */
export type NodeJsRawMetricType = RawMetricType<NODEJS_AVAILABLE_METRICS>

/**
 * Contains the metadata for the node.js metrics
 */
export const NODEJS_METRICS_RAW: NodeJsRawMetricType[] = [];

/**
 * The node.js metrics instances from the raw metrics
 */
export const NODEJS_METRICS = NODEJS_METRICS_RAW.map(createInstanceFromRawMetric).filter(x => x !== undefined)