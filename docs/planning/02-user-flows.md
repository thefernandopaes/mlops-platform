graph TD
    %% MVP Core User Flows - Essential Journeys Only

    %% 1. ONBOARDING & SETUP FLOW
    subgraph "Flow 1: User Onboarding (First-Time Setup)"
        A1[User Visits Platform] --> A2[Sign Up / Login]
        A2 --> A3[Create Organization]
        A3 --> A4[Create First Project]
        A4 --> A5[Upload First Model]
        A5 --> A6[Deploy Model]
        A6 --> A7[✅ Ready to Use]
    end

    %% 2. MODEL DEVELOPMENT FLOW
    subgraph "Flow 2: Model Development & Experimentation"
        B1[📊 Data Scientist Login] --> B2[Select Project]
        B2 --> B3[Create New Model]
        B3 --> B4[Upload Model File]
        B4 --> B5[Add Metadata & Tags]
        B5 --> B6[Create Experiment]
        B6 --> B7[Track Training Runs]
        B7 --> B8[Compare Results]
        B8 --> B9{Satisfied with Results?}
        B9 -->|No| B6
        B9 -->|Yes| B10[Promote to Staging]
        B10 --> B11[✅ Model Ready for Deploy]
    end

    %% 3. MODEL DEPLOYMENT FLOW
    subgraph "Flow 3: Model Deployment"
        C1[🚀 ML Engineer Login] --> C2[Select Model Version]
        C2 --> C3[Choose Environment]
        C3 --> C4[Configure Deployment]
        C4 --> C5[Deploy Model]
        C5 --> C6[Verify Health Check]
        C6 --> C7{Deployment Successful?}
        C7 -->|No| C8[Check Logs & Debug]
        C8 --> C4
        C7 -->|Yes| C9[Test API Endpoint]
        C9 --> C10[✅ Production Ready]
    end

    %% 4. MONITORING & ALERTING FLOW
    subgraph "Flow 4: Production Monitoring"
        D1[📈 Engineering Manager Login] --> D2[View Dashboard]
        D2 --> D3[Check Model Performance]
        D3 --> D4{Performance Issues?}
        D4 -->|No| D5[Monitor Trends]
        D4 -->|Yes| D6[Investigate Alert]
        D6 --> D7[Analyze Metrics]
        D7 --> D8{Need Rollback?}
        D8 -->|Yes| D9[Rollback to Previous Version]
        D8 -->|No| D10[Adjust Configuration]
        D9 --> D11[Notify Team]
        D10 --> D11
        D11 --> D12[✅ Issue Resolved]
    end

    %% 5. INFERENCE USAGE FLOW
    subgraph "Flow 5: Model Inference (External User)"
        E1[🤖 External Application] --> E2[Get API Key]
        E2 --> E3[Send Prediction Request]
        E3 --> E4[Receive Prediction]
        E4 --> E5[Process Result]
        E5 --> E6[✅ Business Logic Complete]
    end

    %% CRITICAL DECISION POINTS
    style B9 fill:#fff2cc,stroke:#d6b656
    style C7 fill:#fff2cc,stroke:#d6b656
    style D4 fill:#fff2cc,stroke:#d6b656
    style D8 fill:#fff2cc,stroke:#d6b656

    %% SUCCESS ENDPOINTS
    style A7 fill:#d5e8d4,stroke:#82b366
    style B11 fill:#d5e8d4,stroke:#82b366
    style C10 fill:#d5e8d4,stroke:#82b366
    style D12 fill:#d5e8d4,stroke:#82b366
    style E6 fill:#d5e8d4,stroke:#82b366

    %% ERROR/RETRY PATHS
    style C8 fill:#f8cecc,stroke:#b85450
    style D6 fill:#f8cecc,stroke:#b85450