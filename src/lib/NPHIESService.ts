export class NPHIESService {
  private baseUrl = process.env.NPHIES_BASE_URL || 'https://nphies.sa/fhir/R4';
  private clientId = process.env.NPHIES_CLIENT_ID;
  private clientSecret = process.env.NPHIES_CLIENT_SECRET;

  async authenticate(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId!,
        client_secret: this.clientSecret!,
        scope: 'read write'
      })
    });

    const data = await response.json();
    return data.access_token;
  }

  async submitClaim(claim: any): Promise<any> {
    const token = await this.authenticate();
    
    const response = await fetch(`${this.baseUrl}/Claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(claim)
    });

    return response.json();
  }

  async checkEligibility(coverage: any): Promise<any> {
    const token = await this.authenticate();
    
    const response = await fetch(`${this.baseUrl}/CoverageEligibilityRequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(coverage)
    });

    return response.json();
  }

  async getClaimStatus(claimId: string): Promise<any> {
    const token = await this.authenticate();
    
    const response = await fetch(`${this.baseUrl}/Claim/${claimId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/fhir+json'
      }
    });

    return response.json();
  }
}
