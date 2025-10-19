import AsyncStorage from '@react-native-async-storage/async-storage';

export async function GET(request: Request) {
  try {
    const venueData = await AsyncStorage.getItem('venue-dates');
    const holdPeriod = await AsyncStorage.getItem('hold-period');
    
    if (!venueData) {
      return Response.json({
        dates: {},
        holdPeriod: parseInt(holdPeriod || '7', 10),
        readonly: true,
        message: 'This calendar is read-only for public viewing'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Cache-Control': 'public, max-age=60',
        }
      });
    }

    const dates = JSON.parse(venueData);
    
    return Response.json({
      dates,
      holdPeriod: parseInt(holdPeriod || '7', 10),
      readonly: true,
      message: 'This calendar is read-only for public viewing'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=60',
      }
    });
  } catch (error) {
    return Response.json({
      error: 'Failed to fetch calendar data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
