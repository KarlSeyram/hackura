
import { google } from 'googleapis';
import { subDays, format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Users, BookOpen, Percent, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Configuration ---
// IMPORTANT: Replace with your actual GA4 Property ID
const propertyId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.replace('G-', '') || '';

// --- Authentication ---
// Instructions:
// 1. Create a service account in Google Cloud Platform with "Analytics Viewer" role.
// 2. Generate a JSON key for this service account.
// 3. Store the key in environment variables (e.g., in Vercel or .env.local).
//    - GOOGLE_CLIENT_EMAIL=service-account-email@...
//    - GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const analyticsDataClient = google.analyticsdata({
    version: 'v1beta',
    auth,
});

// --- Data Fetching Functions ---

async function getAnalyticsData() {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google service account credentials are not configured.');
    }
    if (!propertyId) {
        throw new Error('GA4 Property ID is not configured.');
    }

    const today = new Date();
    const startDate = format(subDays(today, 29), 'yyyy-MM-dd'); // Last 30 days
    const endDate = format(today, 'yyyy-MM-dd');

    try {
        const [totalUsersRes, topPagesRes, conversionRes] = await Promise.all([
            // 1. Total Visitors
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'totalUsers' }],
                },
            }),
            // 2. Most Visited Book Pages
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [{ name: 'pagePathPlusQueryString' }, { name: 'pageTitle' }],
                    metrics: [{ name: 'screenPageViews' }],
                    dimensionFilter: {
                        filter: {
                            fieldName: 'pagePath',
                            stringFilter: { matchType: 'BEGINS_WITH', value: '/products/' }
                        }
                    },
                    limit: 5,
                    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                },
            }),
             // 3. Conversion Rate (simple version: purchases / users)
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'totalUsers' }, { name: 'ecommercePurchases' }],
                },
            }),
        ]);

        // Process Total Visitors
        const totalUsers = totalUsersRes.data.rows?.[0]?.metricValues?.[0]?.value || '0';

        // Process Top Pages
        const topPages = topPagesRes.data.rows?.map(row => ({
            path: row.dimensionValues?.[0]?.value || 'N/A',
            title: row.dimensionValues?.[1]?.value?.replace(' | Hackura', '') || 'Unknown Title',
            views: row.metricValues?.[0]?.value || '0',
        })) || [];
        
        // Process Conversion Rate
        const totalVisitorsForConversion = parseInt(conversionRes.data.rows?.[0]?.metricValues?.[0]?.value || '0');
        const totalPurchases = parseInt(conversionRes.data.rows?.[0]?.metricValues?.[1]?.value || '0');
        const conversionRate = totalVisitorsForConversion > 0 ? (totalPurchases / totalVisitorsForConversion) * 100 : 0;


        return {
            totalUsers: parseInt(totalUsers),
            topPages,
            conversionRate,
            error: null,
        };

    } catch (error: any) {
         console.error("Error fetching Google Analytics data:", error.message);
        // Return a structured error to be displayed in the UI
        return {
            totalUsers: 0,
            topPages: [],
            conversionRate: 0,
            error: error.message || 'An unknown error occurred while fetching analytics data.',
        };
    }
}


export default async function AnalyticsPage() {
    const { totalUsers, topPages, conversionRate, error } = await getAnalyticsData();

    if (error) {
        return (
            <div className="flex-1 space-y-4">
                 <h2 className="font-headline text-3xl font-bold tracking-tight">Analytics</h2>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Failed to Load Analytics Data</AlertTitle>
                    <AlertDescription>
                        <p>Could not connect to the Google Analytics API. Please ensure your service account credentials and GA4 Property ID are correctly configured in your environment variables.</p>
                        <p className="font-mono text-xs mt-2">{error}</p>
                    </AlertDescription>
                </Alert>
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Configuration Instructions</AlertTitle>
                    <AlertDescription>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Go to the Google Cloud Console and select your project.</li>
                            <li>Navigate to "IAM & Admin" &gt; "Service Accounts".</li>
                            <li>Create a new service account with the "Analytics Viewer" role.</li>
                            <li>Create a JSON key for the service account and download it.</li>
                            <li>Set the `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in your environment variables using the values from the JSON key file.</li>
                             <li>Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is also set.</li>
                        </ol>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground">An overview of your store's performance for the last 30 days.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate.toFixed(2)}%</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Product Page</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{topPages[0]?.title || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">{topPages[0]?.views || '0'} views</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Most Visited Books</CardTitle>
                    <CardDescription>Top 5 most viewed product pages in the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Book Title</TableHead>
                                <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topPages.map((page, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium truncate max-w-sm">{page.title}</TableCell>
                                    <TableCell className="text-right">{page.views}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
