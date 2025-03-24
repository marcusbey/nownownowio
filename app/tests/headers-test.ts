"use server";

export async function testHeaders() {
    try {
        const headers = new Headers();
        headers.set('test', 'value');
        const referer = headers.get('referer');

        console.log('Headers test:', {
            headersAvailable: true,
            refererValue: referer || 'not set'
        });

        return {
            success: true,
            headersAvailable: true,
            refererValue: referer || 'not set'
        };
    } catch (error) {
        console.error('Headers test error:', error);

        return {
            success: false,
            error: String(error)
        };
    }
} 