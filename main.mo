import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import Iter "mo:base/Iter";



// Specify the data migration function in with-clause

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();

  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Prompt Optimization Types
  public type PromptOptimization = {
    id : Text;
    timestamp : Int;
    originalPrompt : Text;
    optimizedPrompt : Text;
    originalLength : Nat;
    optimizedLength : Nat;
    estimatedSavings : Float;
  };

  // Report Types
  public type ReportSummary = {
    totalSavings : Float;
    optimizations : [PromptOptimization];
  };

  // Storage - User-specific data isolation
  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  type PromptOptimizationsMap = OrderedMap.Map<Text, PromptOptimization>;

  var userPromptOptimizations = principalMap.empty<PromptOptimizationsMap>();

  // Helper function to get or create user's prompt optimizations map
  private func getUserPromptOptimizationsMap(user : Principal) : PromptOptimizationsMap {
    switch (principalMap.get(userPromptOptimizations, user)) {
      case (?opts) { opts };
      case null { textMap.empty<PromptOptimization>() };
    };
  };

  // Prompt Optimization Functions
  public shared ({ caller }) func savePromptOptimization(opt : PromptOptimization) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save optimizations");
    };

    let userOpts = getUserPromptOptimizationsMap(caller);
    let existingOpt = textMap.get(userOpts, opt.id);

    switch (existingOpt) {
      case (?existing) {
        if (existing.timestamp == opt.timestamp) {
          Debug.trap("Duplicate optimization detected");
        };
      };
      case null {};
    };

    let updatedOpts = textMap.put(userOpts, opt.id, opt);
    userPromptOptimizations := principalMap.put(userPromptOptimizations, caller, updatedOpts);
  };

  public query ({ caller }) func getPromptOptimizations() : async [PromptOptimization] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view optimizations");
    };

    let userOpts = getUserPromptOptimizationsMap(caller);
    Iter.toArray(textMap.vals(userOpts));
  };

  // New function to clear all prompt optimizations for the current user
  public shared ({ caller }) func clearPromptOptimizations() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can clear optimizations");
    };

    userPromptOptimizations := principalMap.remove(userPromptOptimizations, caller).0;
  };

  // Report Generator - User-specific
  public query ({ caller }) func generateReport() : async ReportSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can generate reports");
    };

    let userOpts = getUserPromptOptimizationsMap(caller);
    let optimizations = Iter.toArray(textMap.vals(userOpts));

    var totalSavings : Float = 0;
    for (opt in optimizations.vals()) {
      totalSavings += opt.estimatedSavings;
    };

    {
      totalSavings;
      optimizations;
    };
  };

  // Prompt Analysis Helper - Public utility function
  // No authentication required as it's a pure calculation
  public query func analyzePrompt(prompt : Text) : async {
    length : Nat;
    complexity : Float;
    estimatedSavings : Float;
  } {
    let length = prompt.size();
    let complexity = Float.fromInt(length) / 100.0;
    let estimatedSavings = complexity * 0.0001;

    {
      length;
      complexity;
      estimatedSavings;
    };
  };

  // Time Helper - Public utility function
  // No authentication required as it's a system function
  public query func getCurrentTime() : async Int {
    Time.now();
  };
};

