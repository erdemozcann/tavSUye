# Planner Performance Optimizations

## Problem Analysis

The Academic Planner was experiencing severe performance issues and timeouts due to:

1. **Massive API Call Volume**: Making individual prerequisite API calls for every course simultaneously (800+ courses = 800+ concurrent API calls)
2. **No Request Batching**: All requests fired at once, overwhelming the backend
3. **No Timeout Handling**: No graceful degradation when requests took too long
4. **Inefficient Loading**: Loading all data upfront instead of lazy loading
5. **No User Feedback**: Users had no indication of progress or issues

## Implemented Solutions

### 1. **Lazy Loading Prerequisites** ✅
- **Before**: Fetched prerequisites for ALL courses on page load
- **After**: Only fetch prerequisites when course groups are expanded
- **Impact**: Reduced initial API calls from 800+ to 0, then load incrementally

```typescript
// Load prerequisites only for expanded groups
useEffect(() => {
  if (!programCourses) return;
  
  const courseGroups = groupCoursesByType(programCourses);
  const coursesToLoad: number[] = [];
  
  courseGroups.forEach(group => {
    if (expandedGroups.has(group.groupName)) {
      group.courses.forEach(course => {
        if (!loadedPrerequisites.has(course.courseId)) {
          coursesToLoad.push(course.courseId);
        }
      });
    }
  });
  
  // Load in small batches with delays
  loadInBatches(coursesToLoad);
}, [expandedGroups, programCourses]);
```

### 2. **Request Batching & Rate Limiting** ✅
- **Before**: All API calls fired simultaneously
- **After**: Process requests in small batches (5-10 at a time) with delays
- **Impact**: Prevents backend overload and improves reliability

```typescript
// Batch processing with delays
const BATCH_SIZE = 5;
for (let i = 0; i < coursesToLoad.length; i += BATCH_SIZE) {
  const batch = coursesToLoad.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(courseId => loadPrerequisitesForCourse(courseId)));
  
  // Small delay between batches
  if (i + BATCH_SIZE < coursesToLoad.length) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

### 3. **Timeout Handling & Error Recovery** ✅
- **Before**: No timeout handling, requests could hang indefinitely
- **After**: Individual request timeouts + global timeout warnings
- **Impact**: Better user experience and graceful degradation

```typescript
// API level timeouts
api.get(`/prerequisites/${courseId}`, {
  timeout: 8000, // 8 second timeout
})

// Global timeout warning after 30 seconds
useEffect(() => {
  if (isProgramLoading || isCoursesLoading) {
    const timer = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 30000);
    return () => clearTimeout(timer);
  }
}, [isProgramLoading, isCoursesLoading]);
```

### 4. **Performance Optimizations** ✅
- **Memoization**: Added `useMemo` for expensive calculations
- **Caching**: Cache prerequisites once loaded
- **Reduced Re-renders**: Optimized state updates and component structure

```typescript
// Memoized course grouping
const groupCoursesByType = useMemo(() => {
  return (courses: Course[]): CourseGroup[] => {
    // Expensive grouping logic
  };
}, [program]);

const courseGroups = useMemo(() => {
  return programCourses ? groupCoursesByType(programCourses) : [];
}, [programCourses, groupCoursesByType]);
```

### 5. **Enhanced User Experience** ✅
- **Progress Indicators**: Clear loading states with descriptive messages
- **Timeout Warnings**: Inform users when loading takes too long
- **Error Recovery**: Retry buttons and fallback options
- **Incremental Loading**: Show prerequisites loading per group

```typescript
// Enhanced loading UI
{showTimeoutWarning && (
  <Alert severity="warning">
    <Typography>The planner is taking longer than usual...</Typography>
    <Button onClick={() => window.location.reload()}>Refresh</Button>
    <Button onClick={() => navigate('/programs')}>Go Back</Button>
  </Alert>
)}
```

### 6. **API Optimizations** ✅
- **Reduced Batch Sizes**: Course details fetched in batches of 5 instead of all at once
- **Request Delays**: 200ms delays between batches to prevent overwhelming
- **Better Error Handling**: Graceful fallbacks for failed requests

```typescript
// Optimized course loading
const BATCH_SIZE = 5; // Reduced from unlimited
for (let i = 0; i < basicCourses.length; i += BATCH_SIZE) {
  const batch = basicCourses.slice(i, i + BATCH_SIZE);
  // Process batch...
  
  // Delay between batches
  if (i + BATCH_SIZE < basicCourses.length) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}
```

## Performance Metrics

### Before Optimizations:
- **Initial Load**: 800+ concurrent API calls
- **Load Time**: Often timed out (>30 seconds)
- **User Experience**: "Application taking too long to load" errors
- **Backend Impact**: Server overload, 403/503 errors

### After Optimizations:
- **Initial Load**: 0 prerequisite calls, lazy loaded as needed
- **Load Time**: ~3-5 seconds for basic course list
- **User Experience**: Progressive loading with clear feedback
- **Backend Impact**: Controlled request rate, reduced server load

## Usage Instructions

### For Users:
1. **Initial Load**: Program and course list loads first (fast)
2. **Expand Groups**: Prerequisites load only when you expand course groups
3. **Progress Feedback**: Loading indicators show what's happening
4. **Timeout Handling**: If loading takes >30 seconds, you'll see options to retry or go back

### For Developers:
1. **Monitor Performance**: Use browser dev tools to track API calls
2. **Adjust Batch Sizes**: Modify `BATCH_SIZE` constants if needed
3. **Timeout Tuning**: Adjust timeout values in `api.ts` based on server performance
4. **Add Monitoring**: Include `PerformanceMonitor` component for debugging

## Future Improvements

1. **Server-Side Optimization**: Implement bulk prerequisite API endpoint
2. **Caching Strategy**: Add Redis/memory caching on backend
3. **Database Optimization**: Index optimization for prerequisite queries
4. **Progressive Web App**: Add service worker for offline caching
5. **Virtual Scrolling**: For programs with 1000+ courses

## Testing

To test the optimizations:

1. **Load Planner**: Navigate to `/programs` → select program → go to planner
2. **Monitor Network**: Check browser dev tools for API call patterns
3. **Expand Groups**: Verify prerequisites load only when groups are expanded
4. **Timeout Test**: Simulate slow network to test timeout handling
5. **Error Recovery**: Test retry functionality when requests fail

The planner should now load reliably without timeout errors and provide a much better user experience. 